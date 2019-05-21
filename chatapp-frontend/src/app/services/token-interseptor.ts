import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "./token.service";


@Injectable()
export class TokenInterseptor implements HttpInterceptor {
    constructor(private tokenService: TokenService) {}

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const register = 'http://localhost:3000/api/chatapp/register';
    const login = 'http://localhost:3000/api/chatapp/login';

    // Exclude interceptor for login && register request:
    if (req.url == login || req.url == register) {
        return next.handle(req);
    };
    const headersConfig = {
        'Content-Type': 'application/json', 
        Accept: 'application/json'
    };
    const token = this.tokenService.GetToken();
    if(token) {
        headersConfig['Authorization'] = `bearer ${token}`;
    }
    const _req = req.clone({setHeaders: headersConfig});
    return next.handle(_req);
  }
}

