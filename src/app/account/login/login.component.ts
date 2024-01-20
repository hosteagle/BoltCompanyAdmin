import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';
import { UserService } from '../user.service';
import { Login, LoginDto } from './login.dto';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  fieldTextType:boolean;
  userLoginForm: FormGroup;
  loginDto: any = {}; // Adjust the type as needed
  
  constructor(private toastr: ToastrService, private userService: UserService, private fb: FormBuilder, private activatedRoute: ActivatedRoute, private router: Router) { }
  
  ngOnInit(): void {
    this.createUserLoginForm();
  }

  showToast(token: any, message: string, title: string){
    if(token != null){
      this.toastr.success(message, title);
    } else{
      this.toastr.warning(message, title);
    }
  }
/* 
  login(){
    debugger;
    if (this.userLoginForm.valid) {
      this.loginDto = this.userLoginForm.value;
      this.userService.login(this.loginDto.usernameOrEmail,this.loginDto.password).subscribe();
    }
  }
*/
  login() {
    if (this.userLoginForm.valid) {
      this.loginDto = this.userLoginForm.value;
      this.userService.login(this.loginDto.usernameOrEmail, this.loginDto.password).subscribe(
        (token) => {
          // Token alındı, istediğiniz işlemleri yapabilirsiniz
          console.log('Token:', token);
          // Örneğin, token'i localStorage'e kaydedebilirsiniz
          localStorage.setItem('accessToken', token.accessToken);
          this.showToast(token,"Kullanıcı girişi başarılı.","Gezinmeye başlayabilirsiniz!");
          this.activatedRoute.queryParams.subscribe(params => {
            const returnUrl: string = params["returnUrl"];
            if (returnUrl) {
              this.router.navigate([returnUrl]);
            }
          });
        },
        (error) => {
          console.error('Login Error:', error);
          this.showToast(null,"Email/Kullanıcı adı veya parola hatalı.","Lütfen tekrar deneyiniz.");
          // Hata durumunda gerekli işlemleri yapabilirsiniz
        }
      );
    }
  }

  toggleFieldTextType(){    this.fieldTextType = !this.fieldTextType;
  }

  createUserLoginForm(){
    this.userLoginForm = this.fb.group({
      usernameOrEmail:[''],
      password:['']
    })
  }


}
