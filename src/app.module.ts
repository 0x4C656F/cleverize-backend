import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from './authorization/authorization.module';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    AuthorizationModule,
    ConfigModule.forRoot(),
    UserModule,
    MongooseModule.forRoot(
      'mongodb+srv://veritechcorp:aI07cJ9UVxsZviwp@veritech.ksrjxgg.mongodb.net/?retryWrites=true&w=majority',
    ),
    ProjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
