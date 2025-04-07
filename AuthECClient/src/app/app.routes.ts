import { Routes } from '@angular/router';
import { RegistrationComponent } from './user/registration/registration.component';
import { LoginComponent } from './user/login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './shared/services/auth.guard';
import { DashboardComponent } from './home/dashboard/dashboard.component';
import { ProfileComponent } from './home/profile/profile.component';
import { SettingsComponent } from './home/settings/settings.component';
import { UserComponent } from './user/user.component';
import { AutoLoginGuard } from './shared/services/auto-login.guard';

export const routes: Routes = [
 {
  path:'user' , component:UserComponent ,
  children:[
    {path:'register',component:RegistrationComponent , canActivate:[AutoLoginGuard]},
    {path:'login',component:LoginComponent , canActivate : [AutoLoginGuard]}
  ]
 },
{
  path:'home' ,
  component:HomeComponent,
  canActivate:[AuthGuard],
  children:[
    {path:'dashboard' , component:DashboardComponent},
    {path:'profile' , component: ProfileComponent},
    {path:'settings' , component: SettingsComponent},
    {path:'' , redirectTo:'dashboard',pathMatch:'full'}
  ]
},
{
  path: '' , redirectTo : '/user/register' , pathMatch : 'full'
}
];
