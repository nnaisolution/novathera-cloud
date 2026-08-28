import { permissionProcedure, publicProcedure, router } from '../../trpc/trpc';
import { ProductsService } from './products.service';
import {
  createProductInputSchema,
  createProductCategoryInputSchema,
  listProductsInputSchema,
  productIdInputSchema,
  productSlugInputSchema,
  publicListProductsInputSchema,
  reorderImagesInputSchema,
  setInventoryInputSchema,
  updateProductInputSchema,
} from './schemas/product.schema';

export function createProductsRouter(service: ProductsService) {
  return router({
    publicList: publicProcedure
      .input(publicListProductsInputSchema)
      .query(({ input }) => service.publicList(input)),

    publicGetBySlug: publicProcedure
      .input(productSlugInputSchema)
      .query(({ input }) => service.publicGetBySlug(input.slug)),

    publicFacets: publicProcedure.query(() => service.publicFacets()),

    publicListCategories: publicProcedure.query(() => service.listCategories()),

    list: permissionProcedure('product', 'read')
      .input(listProductsInputSchema)
      .query(({ input }) => service.list(input)),

    getById: permissionProcedure('product', 'read')
      .input(productIdInputSchema)
      .query(({ input }) => service.getById(input.id)),

    create: permissionProcedure('product', 'create')
      .input(createProductInputSchema)
      .mutation(({ input }) => service.create(input)),

    update: permissionProcedure('product', 'update')
      .input(updateProductInputSchema)
      .mutation(({ input }) => service.update(input)),

    archive: permissionProcedure('product', 'update')
      .input(productIdInputSchema)
      .mutation(({ input }) => service.archive(input.id)),

    reorderImages: permissionProcedure('product', 'update')
      .input(reorderImagesInputSchema)
      .mutation(({ input }) => service.reorderImages(input)),

    setInventory: permissionProcedure('product', 'update')
      .input(setInventoryInputSchema)
      .mutation(({ input }) => service.setInventory(input)),

    listCategories: permissionProcedure('product', 'read').query(() =>
      service.listCategories(),
    ),

    createCategory: permissionProcedure('product', 'create')
      .input(createProductCategoryInputSchema)
      .mutation(({ input }) => service.createCategory(input.name)),
  });
}
