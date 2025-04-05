import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FirstKeyPipe } from '../../shared/pipes/first-key.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule , CommonModule , FirstKeyPipe , RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitted: boolean = false;
  constructor(
    public form : FormBuilder ,
    private authService : AuthService ,
    private router : Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.form.group({
      email : ['' , [Validators.required]],
      password : ['' , [Validators.required ]]
    })
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value)
        .subscribe({
          next: (res: any) => {
            console.log(res);
             if (res.token) {
              this.loginForm.reset();
              this.isSubmitted = false;
              this.toastr.success('user Logged In successfully', 'Login Successful')
            }
          },
          error: err => {
            if (err.error.errors)
              console.log('error:',err);

              // err.error.errors.forEach((x: any) => {
              //   switch (x.code) {
              //     case "DuplicateUserName":
              //       break;

              //     case "DuplicateEmail":
              //       this.toastr.error('Email is already taken.', 'Registration Failed')
              //       break;

              //     default:
              //       this.toastr.error('Contact the developer', 'Registration Failed')
              //       console.log(x);
              //       break;
              //   }
              // })
            else
              console.log('error:',err);
          }

        });
    }
  }

  hasDisplayableError(controlName: string): Boolean {
    const control = this.loginForm.get(controlName);
    return Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched)|| Boolean(control?.dirty))
  }
}
