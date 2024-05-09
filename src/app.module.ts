import { PropertiesModule } from "./schemas/properties/properties.module";
import { ModalsModule } from "./schemas/modals/modals.module";
import { ProjectsModule } from "./schemas/projects/projects.module";
import { UsersModule } from "./schemas/users/users.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import entities from "./entities/entities";

import { MailerModule } from "@nestjs-modules/mailer";
import { S3Module } from "./aws/aws.module";
import { UserAuthGuard } from "./guards/user-auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { AuthModule } from "./auth/auth.module";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
    imports: [
        // ===== configs =====
        // --- database ---
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: "postgres",
                host: configService.get("DATABASE_HOST"),
                port: +configService.get<number>("DATABASE_PORT"),
                username: configService.get("POSTGRES_USER"),
                password: configService.get("POSTGRES_PASSWORD"),
                database: configService.get("POSTGRES_DB"),
                entities: entities,
                synchronize: true,
            }),
            inject: [ConfigService],
        }),

        // ===== tables =====
        PropertiesModule,
        ModalsModule,
        ProjectsModule,
        UsersModule,
        // ===== services =====
        // --- mailer ---
        MailerModule.forRoot({
            transport: {
                service: process.env.MAILER_SERVICE_PROVIDER,
                auth: {
                    user: process.env.OFFICIAL_EMAIL,
                    pass: process.env.OFFICIAL_EMAIL_PASSWORD,
                },
            },
        }),

        // --- AWS-S3 ---
        S3Module,
        // --- jwt ---
        AuthModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "1d" },
        }),
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: UserAuthGuard,
        },
        AppService,
    ],
    exports: [AppService],
})
export class AppModule {}
