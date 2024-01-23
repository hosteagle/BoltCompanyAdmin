import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductDto, ProductImageDto, ProductImagesDto, ProductsDto } from './productAndImage.dto';
import { Product, ProductImage } from './productsAndImages.model';

@Injectable({
  providedIn: 'root'
})
export class ProductsAndImagesService {
  token: string = localStorage.getItem("accessToken");
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`
  });
  constructor(private httpClient: HttpClient) { }

  getProductList(): Observable<ProductsDto> {
    return this.httpClient.get<ProductsDto>(environment.apiUrl + '/Products', { headers: this.headers })
  }

  getProductById(id: string): Observable<ProductDto> {
    return this.httpClient.get<ProductDto>(`${environment.apiUrl}/Products/${id}`, { headers: this.headers })
  }

  addProduct(product: Product): Observable<any> {

    return this.httpClient.post(environment.apiUrl + '/Products/', product, { responseType: 'text', headers: this.headers });
  }

  updateProduct(product: Product): Observable<any> {
    return this.httpClient.put(environment.apiUrl + '/Products/', product, { responseType: 'text', headers: this.headers });

  }

  deleteProduct(id: string) {
    return this.httpClient.request('delete', environment.apiUrl + '/Products/', { body: { id: id }, headers: this.headers });
  }


  //Product Image

  getProductImageList(): Observable<ProductImagesDto> {
    return this.httpClient.get<ProductImagesDto>(environment.apiUrl + '/ProductImages', { headers: this.headers })
  }

  getProductImageListByProductId(productId: string): Observable<ProductImagesDto> {
    return this.httpClient.get<ProductImagesDto>(`${environment.apiUrl}/ProductImages/pid/${productId}`, { headers: this.headers })
  }

  getProductImageById(id: string): Observable<ProductImageDto> {
    return this.httpClient.get<ProductImageDto>(`${environment.apiUrl}/ProductImages/${id}`, { headers: this.headers })
  }

  addProductImage(formData: FormData, productImage: ProductImage): Observable<any> {
    return this.httpClient.post(environment.apiUrl + '/ProductImages/', formData, { headers: this.headers });
  }
  
  updateProductImage(formData: FormData): Observable<any> {
    return this.httpClient.put(environment.apiUrl + '/ProductImages/', formData, { responseType: 'text', headers: this.headers });

  }

  deleteProductImage(id: string) {
    return this.httpClient.request('delete', environment.apiUrl + '/ProductImages/', { body: { id: id }, headers: this.headers });
  }

}
