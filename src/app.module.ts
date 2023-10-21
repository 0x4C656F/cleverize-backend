import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import config from "./config/config";
import { AuthorizationModule } from "./modules/authorization/authorization.module";
import { UserModule } from "./modules/user/user.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [config],
			isGlobal: true,
		}),
		MongooseModule.forRoot(process.env.MONGODB_URI),
		UserModule,
		AuthorizationModule,
	],
	controllers: [AppController],
	providers: [AppService],
	exports: [],
})
export class AppModule {}
