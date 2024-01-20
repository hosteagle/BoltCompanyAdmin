import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { About } from './abouts.model';
import { environment } from 'src/environments/environment';
import { AboutDto, AboutsDto } from './abouts.dto';

@Injectable({
  providedIn: 'root'
})
export class AboutsService {
  token: string = localStorage.getItem("accessToken");
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`
  });
  constructor(private httpClient: HttpClient) { }

  getAboutList(): Observable<AboutsDto> {
    return this.httpClient.get<AboutsDto>(environment.apiUrl + '/Abouts', { headers: this.headers })
  }

  getAboutById(id: string): Observable<AboutDto> {
    return this.httpClient.get<AboutDto>(`${environment.apiUrl}/Abouts/${id}`, { headers: this.headers })
  }

  addAbout(about: About): Observable<any> {

    return this.httpClient.post(environment.apiUrl + '/Abouts/', about, { responseType: 'text', headers: this.headers });
  }

  updateAbout(about: About): Observable<any> {
    return this.httpClient.put(environment.apiUrl + '/Abouts/', about, { responseType: 'text', headers: this.headers });

  }

  deleteAbout(id: string) {
    return this.httpClient.request('delete', environment.apiUrl + '/Abouts/', { body: { id: id }, headers: this.headers });
  }

}
