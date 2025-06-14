import { IsString, IsEmail, Length } from 'class-validator';

export class LoginUserDto {
    @IsString({ message: 'Должно быть строкой' })
    @IsEmail({}, { message: 'Некорректный email' })
    readonly user_email: string;

    @IsString({ message: 'Должно быть строкой' })
    @Length(4, 16, { message: 'Пароль должен быть не меньше 4 и не больше 16 символов' })
    readonly user_password: string; // Пароль обязателен для логина
}