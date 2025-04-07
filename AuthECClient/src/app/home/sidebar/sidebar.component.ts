import { Component, input } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  imports: [MatIconModule , MatListModule , MatSidenavModule , RouterLink , RouterOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  currentUserEmail = input.required<string>();
  currentUserUsername = input.required<string>();
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log(this.currentUserEmail());
    console.log(this.currentUserUsername());

  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/user/login']);
  }
}
