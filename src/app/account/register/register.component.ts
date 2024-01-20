import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { User } from '../user.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: User;
  userForm: FormGroup;

  constructor(private userService: UserService, private fb: FormBuilder) { }

  ngOnInit() {
    this.createUserAddForm();
  }

  register() {
    debugger;
    if (this.userForm.valid) {
      this.user = this.userForm.value;
      this.userService.create(this.user).subscribe(data => {
        this.user = new User();

      })
    }

  }


  createUserAddForm() {
    this.userForm = this.fb.group({
      id: [null],
      nameSurname: [''],
      username: [''],
      email: [''],
      password: [''],
      passwordConfirm: ['']
    })
  }
}
