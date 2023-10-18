import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async upsertUser(@Body() userData: any): Promise<any> {
    const user = await this.userService.findOrCreate(userData);
    return user;
  }
  @Get('/all')
  async findAll(): Promise<any> {
    return this.userService.findAll();
  }
}
