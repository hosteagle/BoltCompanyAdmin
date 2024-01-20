import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Token } from './contracts/token/token';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient,private router: Router) { }

  create(user: User): Observable<any>{
    return this.httpClient.post(environment.apiUrl + '/Users/', user, { responseType: 'text' });
  }

  login(userNameOrEmail: string, password: string): Observable<Token | any> {
    return this.httpClient.post(environment.apiUrl + '/Users/Login', { userNameOrEmail, password }, { responseType: 'json' })
      .pipe(
        map((response: any) => {
          // Assuming the response contains a property 'token' with the token data
          return response.token as Token;
        })
      );
  }

  logout(){
    localStorage.removeItem("accessToken");
    this.router.navigate(["giris-yap"],{queryParams: {returnUrl: "/"}});

  }

}
