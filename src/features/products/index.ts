export { productService, ProductService } from "./api/product.service";
export {
  useCreateProduct,
  useUpdateProductStatus,
  useProducts,
  useUpdateProduct,
} from "./hooks/use-products";
export type {
  Product,
  ProductImageManifestItem,
  ProductMultipartPayload,
  ProductPayload,
  ProductVariant,
  ProductVariantGroupInput,
} from "./types/product";
