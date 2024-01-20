import { Category } from "./categories.model"

export interface CategoryDto{
    category:Category,
    message:string,
    statusCode:string
  }

  export interface CategoriesDto{
    categories:Category[],
    message:string,
    statusCode:string
  }