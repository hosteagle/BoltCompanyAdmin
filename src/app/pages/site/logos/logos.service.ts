import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, SecurityContext } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Logo, LogoDto, LogosDto } from './logos.model';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class LogosService {
  token: string = localStorage.getItem("accessToken");
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.token}`
  });
  constructor(private httpClient: HttpClient,private sanitizer: DomSanitizer) { }

  getLogoList(): Observable<LogosDto> {
    return this.httpClient.get<LogosDto>(environment.apiUrl + '/Logos', { headers: this.headers })
  }

  getLogoById(id: string): Observable<LogoDto> {
    return this.httpClient.get<LogoDto>(`${environment.apiUrl}/Logos/${id}`, { headers: this.headers })
  }

  addLogo(formData: FormData): Observable<any> {
    return this.httpClient.post(environment.apiUrl + '/Logos/', formData, { headers: this.headers });
  }
  
  updateLogo(formData: FormData): Observable<any> {
    return this.httpClient.put(environment.apiUrl + '/Logos/', formData, { responseType: 'text', headers: this.headers });
  }

  deleteLogo(id: string) {
    return this.httpClient.request('delete', environment.apiUrl + '/Logos/', { body: { id: id }, headers: this.headers });
  }

  getFileBlobSafeUrl(fileName: string): Observable<any> {
    debugger;
    const url = environment.serverFilePath + '/logos/' + fileName;
    const safeurl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    
    // Extract the actual URL from the SafeResourceUrl
    const urlWithoutSecurity = this.sanitizer.sanitize(SecurityContext.URL, safeurl);
    
    return this.httpClient.get(urlWithoutSecurity, { responseType: 'blob' });
  }

  getImage(url: string): Observable<Blob> {
    return this.httpClient.get(url, { responseType: 'blob' });
  }
}
