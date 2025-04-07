import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet , SidebarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentUser: any;

  constructor(private authService: AuthService, private jwtHelper: JwtHelperService) {
    const token = authService.getAccessToken();
    if (token) {
      this.currentUser = this.jwtHelper.decodeToken(token);
    }
  }

  logout() {
    this.authService.logout();
  }
}
