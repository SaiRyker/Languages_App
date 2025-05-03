import { Injectable } from '@nestjs/common';
import {User} from "./user.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private usersRepository: typeof User,
                private roleService: RolesService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.usersRepository.create(dto);
        const role = await  this.roleService.getRoleByValue("user")
        if (!role) {
            throw new Error("Role 'user' not found");
        }
        await user.$set('roles', [role])
        return user;
    }

    async getAllUser() {
        const users = await this.usersRepository.findAll({include: {all: true}});
        return users;
    }
}
