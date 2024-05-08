import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { AppService } from './app.service';
import { CommonModule, Location } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'client';
  currentUrl: string;

  constructor(appService: AppService, router: Router, location: Location) {
    this.currentUrl = location.path();

    appService.isLoggedIn.subscribe((val) => {
      if (val === true) {
        router.navigate(['dashboard']);
      } else if (val === false) {
        router.navigate(['auth']);
      }
    });
  }
}
