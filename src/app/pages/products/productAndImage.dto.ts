import { Product, ProductImage } from "./productsAndImages.model"

export interface ProductDto{
    product:Product,
    message:string,
    statusCode:string
  }

  export interface ProductsDto{
    products:Product[],
    message:string,
    statusCode:string
  }

  export interface ProductImageDto{
    productImage:ProductImage,
    message:string,
    statusCode:string
  }

  export interface ProductImagesDto{
    productImages:ProductImage[],
    message:string,
    statusCode:string
  }