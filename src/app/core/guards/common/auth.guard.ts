// auth.guard.ts

import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class authGuard implements CanActivate {
  constructor(private jwtHelper: JwtHelperService, private router: Router, private toastr: ToastrService) {}


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token: string = localStorage.getItem("accessToken");
  //  const decodeToken = this.jwtHelper.decodeToken(token);
  //  const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
  //  const expired: boolean = this.jwtHelper.isTokenExpired(token);

  let expired: boolean;

  try {
    expired = this.jwtHelper.isTokenExpired(token);
  } catch (error) {
    expired = true;
  }

  if (!token || expired) {
    this.router.navigate(["giris-yap"],{queryParams: {returnUrl: state.url}});
    this.toastr.warning("Oturum açmanız gerekiyor!", "Yetkisiz Erişim!");
  }
    return true; // Eğer kullanıcı giriş yapmışsa true dönebilirsiniz.
  }
}