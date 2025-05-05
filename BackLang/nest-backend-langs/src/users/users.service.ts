import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {User} from "./user.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";
import {Role} from "../roles/roles.model";
import {addRoleDto} from "../roles/dto/add-role.dto";

@Injectable()
export class UsersService {

    constructor(@InjectModel(User) private userRepository: typeof User,
                private roleService: RolesService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue("admin")
        await user.$set('roles', [role.dataValues.id_role])
        user.roles = [role.dataValues]
        console.log(user)
        return user;
    }

    // async createUser(dto: CreateUserDto) {
    //     const user = await this.userRepository.create(dto);
    //     const role = await this.roleService.getRoleByValue("user")
    //     console.log(role.id_role)
    //     console.log(role.id_role)
    //     if (!role) {
    //         throw new Error("Role 'user' not found");
    //     }
    //     await user.$add('roles', [role.id_role])
    //     user.roles = [role];
    //     return user;
    // }

    async getAllUser() {
        const users = await this.userRepository.findAll({include: {all: true}});
        return users;
    }

    async getUserByEmail(user_email: string) {

        if (!user_email) {
            throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
        }

        const user = await this.userRepository.findOne({where: {user_email},
            include: {all: true}});
        return user;
    }

    async  addRole(dto: addRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.roleName);
        if (role && user) {
            const tempRoleId = role.get("id_role")
            await user.$add('role', tempRoleId);
            return dto;
        }

        throw new HttpException('Role already exists', HttpStatus.NOT_FOUND);
    }

    // async getUserById(id: number) {
    //     return this.userRepository.findByPk(id, {
    //         include: [{
    //             model: Role,
    //             through: { attributes: [] } // Исключаем данные промежуточной таблицы
    //         }]
    //     });
    // }
}
