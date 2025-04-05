import { Routes } from '@angular/router';
import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';

export const routes: Routes = [
  {
  path: 'register', component: RegistrationComponent
} ,
{
  path: 'login', component: LoginComponent
},
{
  path: '' , redirectTo : '/register' , pathMatch : 'full'
}
];
