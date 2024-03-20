import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


@Component({
  standalone: true,
  selector: 'app-login',
  imports: [ FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./app.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    // Perform login logic here
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    // Navigate to the Dashboard route
    this.router.navigateByUrl('/dashboard');
  }
}