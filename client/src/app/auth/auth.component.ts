import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { AppService } from '../app.service';
import { HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  authForm: FormGroup;
  isLogin: boolean = true;

  constructor(
    formBuilder: FormBuilder,
    private appService: AppService,
    private router: Router
  ) {
    this.authForm = formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
          ),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  async onSubmit() {
    const { email, password } = this.authForm.value;

    try {
      if (this.isLogin) {
        await this.appService.login(email, password);
        this.appService.connectSocket();
        this.router.navigate(['dashboard']);
      } else {
        await this.appService.signup(email, password);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
