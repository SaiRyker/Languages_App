import {Body, Controller, Post, UseGuards} from '@nestjs/common';
import {ApiTags} from "@nestjs/swagger";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {AuthService} from "./auth.service";
import {Roles} from "./roles-auth.decorator";
import {RolesGuard} from "./roles.guard";
import {LoginUserDto} from "../users/dto/login-user.dto";

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('/login')
    login(@Body() userLoginDto: LoginUserDto) {
        return this.authService.login(userLoginDto);
    }

    @Roles("admin")
    @UseGuards(RolesGuard)
    @Post('/register')
    registration(@Body() userDto: CreateUserDto) {
        return this.authService.registration(userDto);
    }
}
