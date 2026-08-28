import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { paginatedResponse } from '../../common/schemas/pagination.schema';
import { handlePrismaError } from '../../common/helpers/prisma-errors';
import { uniqueSlug } from '../../common/helpers/slug';
import { StripeCatalogService } from '../../providers/payments/stripe/stripe-catalog.service';
import { ProductsRepository } from './products.repository';
import type {
  CreateProductInput,
  ListProductsInput,
  PublicListProductsInput,
  ReorderImagesInput,
  SetInventoryInput,
  UpdateProductInput,
} from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly stripeCatalog: StripeCatalogService,
  ) {}

  private async syncStripeProduct(product: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    currency: string;
    brandId: string;
    stripeProductId: string | null;
    stripePriceId: string | null;
  }) {
    const synced = await this.stripeCatalog.syncProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      currency: product.currency,
      stripeProductId: product.stripeProductId,
      stripePriceId: product.stripePriceId,
      // Brand on the Stripe Product means the Dashboard splits revenue by
      // business without any extra reporting work.
      metadata: { type: 'product', brandId: product.brandId },
    });
    if (!synced) return product;
    if (
      synced.stripeProductId !== product.stripeProductId ||
      synced.stripePriceId !== product.stripePriceId
    ) {
      return this.repository.updateStripeIds(
        product.id,
        synced.stripeProductId,
        synced.stripePriceId,
      );
    }
    return product;
  }

  async publicList(input: PublicListProductsInput) {
    const { items, total } = await this.repository.findManyPublic(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async publicFacets() {
    return this.repository.findPublicFacets();
  }

  async publicGetBySlug(slug: string) {
    const product = await this.repository.findBySlugPublic(slug);
    if (!product) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    return product;
  }

  async list(input: ListProductsInput) {
    const { items, total } = await this.repository.findMany(input);
    return paginatedResponse(items, total, input.page, input.limit);
  }

  async getById(id: string) {
    const product = await this.repository.findById(id);
    if (!product) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
    }
    return product;
  }

  async create(input: CreateProductInput) {
    const {
      images,
      inventoryQuantity,
      lowStockThreshold,
      allowBackorder,
      ...data
    } = input;

    try {
      const slug = await uniqueSlug(input.name, (value) =>
        this.repository.slugExists(value),
      );
      const product = await this.repository.create({ ...data, slug }, images, {
        quantity: inventoryQuantity,
        lowStockThreshold,
        allowBackorder,
      });
      if (!product) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      return this.syncStripeProduct(product);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async update(input: UpdateProductInput) {
    const {
      id,
      images,
      inventoryQuantity,
      lowStockThreshold,
      allowBackorder,
      ...data
    } = input;
    await this.getById(id);

    try {
      const updateData: typeof data & { slug?: string } = { ...data };
      if (data.name) {
        updateData.slug = await uniqueSlug(data.name, (value) =>
          this.repository.slugExists(value, id),
        );
      }

      const product = await this.repository.update(id, updateData, images);
      if (!product) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      if (
        inventoryQuantity !== undefined ||
        lowStockThreshold !== undefined ||
        allowBackorder !== undefined
      ) {
        await this.repository.setInventory({
          productId: id,
          quantity: inventoryQuantity ?? product.inventory?.quantity ?? 0,
          lowStockThreshold,
          allowBackorder,
        });
      }

      const shouldSync =
        !product.stripeProductId ||
        !product.stripePriceId ||
        data.name !== undefined ||
        data.description !== undefined ||
        data.priceCents !== undefined;

      if (shouldSync) {
        const refreshed = await this.getById(id);
        return this.syncStripeProduct(refreshed);
      }

      return this.getById(id);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async archive(id: string) {
    await this.getById(id);
    try {
      return await this.repository.archive(id);
    } catch (error) {
      handlePrismaError(error);
    }
  }

  async reorderImages(input: ReorderImagesInput) {
    await this.getById(input.productId);
    try {
      const product = await this.repository.reorderImages(
        input.productId,
        input.imageIds,
      );
      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }
      return product;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async setInventory(input: SetInventoryInput) {
    await this.getById(input.productId);
    try {
      await this.repository.setInventory(input);
      return this.getById(input.productId);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      handlePrismaError(error);
    }
  }

  async listCategories() {
    return this.repository.findCategories();
  }

  async createCategory(name: string) {
    try {
      const slug = await uniqueSlug(name, (value) =>
        this.repository.categorySlugExists(value),
      );
      return this.repository.createCategory(name, slug);
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
