import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
// import { AuthModule } from './modules/auth.module';
// import { AuthRoutingModule } from './modules/auth-routing.module';
// import { StreamsModule } from './modules/streams.module';
// import { StreamsRoutingModule } from './modules/streams-routing.module';
// import { TokenInterseptor } from './services/token-interseptor';
import { CookieService } from 'ngx-cookie-service';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';



@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule
  ],
  providers: [
    CookieService,
    // {
    //   provide: HTTP_INTERCEPTORS, 
    //   useClass: TokenInterseptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
