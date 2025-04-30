import { Injectable } from '@nestjs/common';
import {User} from "./user.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private usersRepository: typeof User) {
    }

    async createUser(dto: CreateUserDto) {
        const user = await this.usersRepository.create(dto);
        return user;
    }

    async getAllUser() {
        const users = await this.usersRepository.findAll();
        return users;
    }
}
