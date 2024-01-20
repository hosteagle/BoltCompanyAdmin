import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CategoriesDto, CategoryDto } from './categories.dto';
import { Category } from './categories.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  token: string = localStorage.getItem("accessToken");
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`
  });
  constructor(private httpClient: HttpClient) { }

  getCategoryList(): Observable<CategoriesDto> {
    return this.httpClient.get<CategoriesDto>(environment.apiUrl + '/Categories', { headers: this.headers })
  }

  getCategoryById(id: string): Observable<CategoryDto> {
    return this.httpClient.get<CategoryDto>(`${environment.apiUrl}/Categories/${id}`, { headers: this.headers })
  }

  addCategory(category: Category): Observable<any> {

    return this.httpClient.post(environment.apiUrl + '/Categories/', category, { responseType: 'text', headers: this.headers });
  }

  updateCategory(category: Category): Observable<any> {
    return this.httpClient.put(environment.apiUrl + '/Categories/', category, { responseType: 'text', headers: this.headers });

  }

  deleteCategory(id: string) {
    return this.httpClient.request('delete', environment.apiUrl + '/Categories/', { body: { id: id }, headers: this.headers });
  }

}
