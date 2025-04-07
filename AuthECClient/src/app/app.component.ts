import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserComponent } from "./user/user.component";
import { AuthService } from './shared/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UserComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'AuthECClient';
  constructor(private authService : AuthService){}

  ngOnInit() : void {
    this.authService.initializeAuthState().then(() => {
      console.log("Auth initialized");

    })
  }
}
