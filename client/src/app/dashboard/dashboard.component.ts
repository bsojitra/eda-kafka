import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

export interface Message {
  sender: User;
  users: User[];
  text: string;
}

export interface User {
  id: string;
  email: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    NgSelectModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  messages: Message[] = [];
  newMessage: string = '';
  selectedUsers: User[] = [];
  users!: User[];
  me!: User;
  isChat: boolean = false;

  @ViewChild('chatContainer') private chatContainer?: ElementRef;

  constructor(private appService: AppService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    const res1 = await this.appService.allUsers();
    this.users = res1.data;

    const res2 = await this.appService.myProfile();
    this.me = res2.data;

    this.appService.socket.on('receive-chat', (msg: any) => {
      console.log(msg);

      this.messages.push(msg);

      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop =
          this.chatContainer.nativeElement.scrollHeight;
      }
    });
  }

  onChange() {
    this.isChat = false;
  }

  onUserSelected() {
    console.log(this.selectedUsers);
    this.isChat = true;
  }

  filterMessage() {
    if (!this.me) {
      return [];
    }

    const arr1 = [this.me, ...this.selectedUsers]
      .map((usr) => usr.id)
      .slice()
      .sort();

    return this.messages.filter((msg) => {
      const arr2 = msg.users
        .map((usr) => usr.id)
        .slice()
        .sort();

      if (arr1.length !== arr2.length) {
        return false;
      }

      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }

      return true;
    });
  }

  sendMessage() {
    if (this.newMessage.trim() === '') return;

    const newMessage: Message = {
      sender: this.me,
      users: [this.me, ...this.selectedUsers],
      text: this.newMessage,
    };

    this.appService.socket.emit('send-chat', newMessage);

    // this.messages.push(newMessage);
    this.newMessage = '';

    // if (this.chatContainer) {
    //   this.chatContainer.nativeElement.scrollTop =
    //     this.chatContainer.nativeElement.scrollHeight;
    // }
  }

  async onLogout() {
    await this.appService.logout();
    this.router.navigate(['auth']);
  }
}
