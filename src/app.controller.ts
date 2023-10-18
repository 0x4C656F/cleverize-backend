import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthorizationGuard } from './authorization/authorization.guard';
import { expressjwt, Request as JWTRequest } from 'express-jwt';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @UseGuards(AuthorizationGuard)
  @Get('/protected')
  getPrivate(@Req() request: JWTRequest): string {
    const auth = request.auth;
    console.log(auth.sub);
    return JSON.stringify({ data: 'you have reached unreachable' });
  }
}
