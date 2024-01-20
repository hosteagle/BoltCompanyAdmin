export class Product{
    id?:string;
    name?:string;
    description?:string;
    specification?:string;
    createdDate?:(Date | any);
    updatedDate?:(Date | any);
    isModified?:boolean;
    isDeleted?:boolean;
}

export class ProductImage{
    id?:string;
    imageUrl?:string;
    productId?:string;
    isCoverImage?:boolean;
    createdDate?:(Date | any);
    updatedDate?:(Date | any);
    isModified?:boolean;
    isDeleted?:boolean;
}