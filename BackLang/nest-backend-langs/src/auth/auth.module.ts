import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from '../roles/roles.model';
import process from "node:process";

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        forwardRef(() => UsersModule),
        forwardRef(() => RolesModule),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_TOKEN || 'SECRET',
            signOptions: {
                expiresIn: '24h',
            },
        }),
        SequelizeModule.forFeature([Role]), // Добавляем поддержку модели Role
    ],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}