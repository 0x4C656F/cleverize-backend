import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./app.module";
import config from "./config/config";

async function bootstrap() {
	const { port } = config();

	const swaggerConfig = new DocumentBuilder()
		.setTitle("Veritech backend documentation")
		.setVersion("1.0.0")
		.addBearerAuth()
		.build();

	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("api");

	app.use(helmet());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.enableCors();
	const document = SwaggerModule.createDocument(app, swaggerConfig);
	SwaggerModule.setup("/api/docs", app, document);

	await app.listen(port);
	Logger.log(
		`Gateway is started on http://localhost:${port} in ${
			process.env.NODE_ENV || "development"
		} mode`,
		"NestApplication"
	);
	const used = process.memoryUsage().heapUsed / 1024 / 1024;
	console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
}

void bootstrap();
