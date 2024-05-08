import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Socket, io } from 'socket.io-client';
import { BehaviorSubject } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
  deps: [HttpClientModule],
})
export class AppService {
  socket!: Socket<any, any>;
  isLoggedIn = new BehaviorSubject<boolean | null>(null);

  constructor() {
    try {
      this.socket = io(environment.baseUrl, {
        withCredentials: true,
        closeOnBeforeunload: true,
      });

      this.socket.on('connect', () => {
        console.log('Here?');

        this.isLoggedIn.next(this.socket.connected);
      });

      this.socket.on('disconnect', () => {
        this.isLoggedIn.next(this.socket.connected);
      });
    } catch (error) {
      console.log('error: ', error);
    }
  }

  connectSocket() {
    this.socket.close();
    this.socket = io(environment.baseUrl, {
      withCredentials: true,
      closeOnBeforeunload: true,
    });
  }

  login(email: string, password: string) {
    return axios.post(
      `${environment.baseUrl}/auth/login`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
  }

  signup(email: string, password: string) {
    return axios.post(
      `${environment.baseUrl}/auth/signup`,
      {
        email,
        password,
      },
      {
        withCredentials: true,
      }
    );
  }

  logout() {
    return axios.post(
      `${environment.baseUrl}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  }

  myProfile() {
    return axios.get(`${environment.baseUrl}/user/me`, {
      withCredentials: true,
    });
  }

  allUsers() {
    return axios.get(`${environment.baseUrl}/user/all`, {
      withCredentials: true,
    });
  }

  newChat(users: string[]) {
    return axios.post(
      `${environment.baseUrl}/chat/new`,
      {
        users,
      },
      {
        withCredentials: true,
      }
    );
  }
}
