import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
// import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

import { AppModule } from "./app.module";
import config from "./config/configuration";

async function bootstrap() {
	const { port } = config();

	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		rawBody: true,
		cors: {
			credentials: true,
		},
	});

	app.setGlobalPrefix("api");
	app.use(cookieParser());
	app.use(helmet());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.enableCors();

	// const swaggerConfig = new DocumentBuilder()
	// 	.setTitle("Veritech backend documentation")
	// 	.setVersion("1.0.0")
	// 	.addBearerAuth()
	// 	.build();

	// const document = SwaggerModule.createDocument(app, swaggerConfig);
	// SwaggerModule.setup("/api/docs", app, document);
	app.use(cookieParser());
	await app.listen(port);
	Logger.log(
		`Gateway is started on http://localhost:${port} in ${
			process.env.NODE_ENV || "development"
		} mode`,
		"NestApplication"
	);
}

void bootstrap();
