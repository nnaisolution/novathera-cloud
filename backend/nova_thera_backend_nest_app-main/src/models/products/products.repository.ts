import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../../providers/database/postgres/prisma.service';
import type {
  CreateProductInput,
  ListProductsInput,
  PublicListProductsInput,
  SetInventoryInput,
  UpdateProductInput,
} from './schemas/product.schema';

function stockAvailable(
  inventory: {
    quantity: number;
    allowBackorder: boolean;
  } | null,
): boolean {
  if (!inventory) return false;
  return inventory.quantity > 0 || inventory.allowBackorder;
}

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly detailInclude = {
    category: true,
    brand: true,
    images: { orderBy: { sortOrder: 'asc' as const } },
    inventory: true,
  } satisfies Prisma.ProductInclude;

  private findByIdWith(
    client: PrismaService | Prisma.TransactionClient,
    id: string,
  ) {
    return client.product.findFirst({
      where: { id, deletedAt: null },
      include: this.detailInclude,
    });
  }

  async slugExists(slug: string, excludeId?: string) {
    const existing = await this.prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async findMany(input: ListProductsInput) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(input.status ? { status: input.status } : {}),
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.brandId ? { brandId: input.brandId } : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: this.detailInclude,
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total };
  }

  async findManyPublic(input: PublicListProductsInput) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      status: 'ACTIVE',
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.brandIds?.length ? { brandId: { in: input.brandIds } } : {}),
      ...(input.concerns?.length
        ? { concerns: { hasSome: input.concerns } }
        : {}),
      ...(input.productTypes?.length
        ? { productTypes: { hasSome: input.productTypes } }
        : {}),
      ...(input.ingredientsFacet?.length
        ? { ingredientsFacet: { hasSome: input.ingredientsFacet } }
        : {}),
      ...(input.skinTypes?.length
        ? { skinTypes: { hasSome: input.skinTypes } }
        : {}),
      ...(input.search
        ? {
            OR: [
              { name: { contains: input.search, mode: 'insensitive' } },
              { description: { contains: input.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          inventory: true,
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip: (input.page - 1) * input.limit,
        take: input.limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        stockAvailable: stockAvailable(item.inventory),
      })),
      total,
    };
  }

  async findPublicFacets() {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: {
        concerns: true,
        productTypes: true,
        ingredientsFacet: true,
        skinTypes: true,
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    const concerns = new Set<string>();
    const productTypes = new Set<string>();
    const ingredientsFacet = new Set<string>();
    const skinTypes = new Set<string>();
    const brands = new Map<
      string,
      { id: string; name: string; slug: string }
    >();

    for (const product of products) {
      if (product.brand) brands.set(product.brand.id, product.brand);
      product.concerns.forEach((value) => concerns.add(value));
      product.productTypes.forEach((value) => productTypes.add(value));
      product.ingredientsFacet.forEach((value) => ingredientsFacet.add(value));
      product.skinTypes.forEach((value) => skinTypes.add(value));
    }

    const categories = await this.prisma.productCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true },
    });

    return {
      concerns: [...concerns].sort(),
      productTypes: [...productTypes].sort(),
      ingredientsFacet: [...ingredientsFacet].sort(),
      skinTypes: [...skinTypes].sort(),
      brands: [...brands.values()].sort((a, b) => a.name.localeCompare(b.name)),
      categories,
    };
  }

  async findBySlugPublic(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, deletedAt: null, status: 'ACTIVE' },
      include: this.detailInclude,
    });
    if (!product) return null;
    return {
      ...product,
      stockAvailable: stockAvailable(product.inventory),
    };
  }

  async findById(id: string) {
    return this.findByIdWith(this.prisma, id);
  }

  async create(
    data: Omit<
      CreateProductInput,
      'images' | 'inventoryQuantity' | 'lowStockThreshold' | 'allowBackorder'
    > & { slug: string },
    images: CreateProductInput['images'],
    inventory: {
      quantity: number;
      lowStockThreshold: number;
      allowBackorder: boolean;
    },
  ) {
    const createData: Prisma.ProductUncheckedCreateInput = {
      ...data,
      categoryId: data.categoryId ?? null,
      images: {
        create: images.map((img, index) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder ?? index,
        })),
      },
      inventory: {
        create: inventory,
      },
    };

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: createData });
      return this.findByIdWith(tx, product.id);
    });
  }

  async update(
    id: string,
    data: Omit<
      UpdateProductInput,
      | 'id'
      | 'images'
      | 'inventoryQuantity'
      | 'lowStockThreshold'
      | 'allowBackorder'
    >,
    images?: CreateProductInput['images'],
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });

      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img, index) => ({
              productId: id,
              url: img.url,
              alt: img.alt,
              sortOrder: img.sortOrder ?? index,
            })),
          });
        }
      }

      return this.findByIdWith(tx, id);
    });
  }

  async archive(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ARCHIVED' },
      include: this.detailInclude,
    });
  }

  async reorderImages(productId: string, imageIds: string[]) {
    await this.prisma.$transaction(
      imageIds.map((imageId, index) =>
        this.prisma.productImage.updateMany({
          where: { id: imageId, productId },
          data: { sortOrder: index },
        }),
      ),
    );
    return this.findById(productId);
  }

  async setInventory(input: SetInventoryInput) {
    const { productId, quantity, lowStockThreshold, allowBackorder } = input;
    return this.prisma.inventoryLevel.upsert({
      where: { productId },
      create: {
        productId,
        quantity,
        lowStockThreshold: lowStockThreshold ?? 5,
        allowBackorder: allowBackorder ?? false,
      },
      update: {
        quantity,
        ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {}),
        ...(allowBackorder !== undefined ? { allowBackorder } : {}),
      },
    });
  }

  async updateStripeIds(
    id: string,
    stripeProductId: string,
    stripePriceId: string,
  ) {
    return this.prisma.product.update({
      where: { id },
      data: { stripeProductId, stripePriceId },
      include: this.detailInclude,
    });
  }

  async findCategories() {
    return this.prisma.productCategory.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, displayOrder: true },
    });
  }

  async categorySlugExists(slug: string) {
    const existing = await this.prisma.productCategory.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async createCategory(name: string, slug: string) {
    return this.prisma.productCategory.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true, displayOrder: true },
    });
  }
}
