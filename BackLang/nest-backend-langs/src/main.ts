import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {JwtAuthGuard} from "./auth/jwt-auth.guard";
import * as process from "node:process";
import {UsersService} from "./users/users.service";


async function start() {
    const PORT = process.env.PORT || 5000;
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('Docs for Backend Langs')
        .setDescription('Документация по бекэнду')
        .setVersion('1.0.0')
        .addTag('FirstTry')
        .build()
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    app.enableCors({
        origin: "http://localhost:5173/",
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    await app.listen(PORT, () => console.log('Server started on port ' + PORT));
}

start()