import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private cookieSrvice: CookieService) { }

  SetToken(token) {
    this.cookieSrvice.set('chat_token', token, 1);
  }

  GetToken() {
    return this.cookieSrvice.get('chat_token');
  }

  DeleteToken() {
    this.cookieSrvice.delete('chat_token');
  }

  GetPayload() {
    const token = this.GetToken();
    let payload;
    if(token) {
      payload = token.split('.')[1];
      payload = JSON.parse(window.atob(payload));
    }

    return payload.data;
  }
}
