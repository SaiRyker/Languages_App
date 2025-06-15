import {HttpException, HttpStatus, Injectable, UnauthorizedException, OnModuleInit} from '@nestjs/common';
import {CreateUserDto} from "../users/dto/create-user.dto";
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import {User} from "../users/user.model";
import {LoginUserDto} from "../users/dto/login-user.dto";

@Injectable()
export class AuthService implements OnModuleInit {

    constructor(private usersService: UsersService,
                private jwtService: JwtService,) {
    }

    async onModuleInit() {
        await this.initializeAdmin();
    }

    async login(userLoginDto: LoginUserDto) {
        const user = await this.validateUser(userLoginDto);
        console.log(user)
        if (!user) {
            throw new UnauthorizedException({message: 'Некорректные почта или парольЭЭЭ'});
        }
        return this.generateToken(user);
    }

    async registration(userDto: CreateUserDto) {
        const candidate = await this.usersService.getUserByEmail(userDto.user_email);
        console.log(candidate)

        if (candidate) {
            throw new HttpException('Пользователь с такой почтой уже существует', HttpStatus.BAD_REQUEST);
        }

        if (userDto.user_password) {
            const password = userDto.user_password;
            const hashPassword = await  bcrypt.hash(password, 5);
            const user = await this.usersService.createUser({...userDto, user_password: hashPassword});
            console.log(userDto);
            return this.generateToken(user);
        }

        const generatedPassword = this.generateStrongPassword(Math.floor(Math.random() * (15 - 8 + 1)) + 8);
        const hashPassword = await  bcrypt.hash(generatedPassword, 5);
        const user = await this.usersService.createUser({...userDto, user_password: hashPassword});
        console.log(userDto, generatedPassword);
        return this.generateToken(user);
    }

    private generateStrongPassword(length: number = 8): string {
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const allChars = uppercase + lowercase + numbers + specialChars;

        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += specialChars[Math.floor(Math.random() * specialChars.length)];

        for (let i = password.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * allChars.length);
            password += allChars[randomIndex];
        }

        password = password
            .split('')
            .sort(() => Math.random() - 0.5)
            .join('');

        return password;
    }

    private async generateToken(user: User) {
        let userRoles = user.get("roles")
        if (!userRoles) {
            userRoles = user.roles
        }
        const payload = {
            login: user.get("user_login"),
            email: user.get("user_email"),
            id: user.get("id_user"),
            roles: userRoles};
        return {
            token: this.jwtService.sign(payload)
        };
    }

    private async validateUser(userLoginDto: LoginUserDto) {
        if (!userLoginDto.user_email || !userLoginDto.user_password) {
            throw new UnauthorizedException('Email и пароль обязательны');
        }

        const user = await this.usersService.getUserByEmail(userLoginDto.user_email);
        if (user instanceof User) {
            const userPass = user.get("user_password");
            if (!user || !userPass) {
                throw new UnauthorizedException({message: 'Некорректные почта или парольEEEE'});
            }

            if (typeof userPass === "string") {
                const passwordEquals = await bcrypt.compare(userLoginDto.user_password, userPass);
                if (!passwordEquals) {
                    throw new UnauthorizedException({message: 'Некорректные почта или парольAAA'});
                }
            }
        }
        return user;
    }

    async initializeAdmin() {
        const adminEmail = "admin@admin.com";
        const existingAdmin = await this.usersService.getUserByEmail(adminEmail)

        if (!existingAdmin) {
            const adminDto: CreateUserDto = {
                user_login: 'admin',
                user_email: adminEmail,
                role_name: "admin",
                user_fio: "admin",
                user_password: "admin1234559)"
            }
            console.log("Создание аккаунта администратора", adminDto);
            return this.registration(adminDto);
        } else {
            console.log("Администратор уже создан", existingAdmin);
        }
    }
}
