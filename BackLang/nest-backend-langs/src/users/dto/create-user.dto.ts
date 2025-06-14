import {IsEmail, IsString, Length} from "class-validator";

export class CreateUserDto {
    //@IsString({message: 'Должно быть строкой'})
    readonly user_login: string;
    //@IsString({message: 'Должно быть строкой'})
    //@IsEmail({}, {message: 'Некорректный email'})
    readonly user_email: string;
    //@IsString({message: 'Должно быть строкой'})
    readonly role_name: string;
    //@IsString({message: 'Должно быть строкой'})
    readonly user_fio?: string;
    //@IsString({message: 'Должно быть строкой'})
    //@Length(4, 16, {message: 'Пароль должен быть не меньше 4 и не больше 16 символов'})
    readonly user_password?: string;
}