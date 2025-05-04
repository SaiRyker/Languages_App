import { Injectable } from '@nestjs/common';
import {Role} from "./roles.model";
import {CreateRoleDto} from "./dto/crete-role.dto";
import {InjectModel} from "@nestjs/sequelize";


@Injectable()
export class RolesService {

    constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

    async createRole(dto: CreateRoleDto){
        const role = await this.roleRepository.create(dto);
        return role;
    }

    async getRoleByValue(role_name: string) {
        const role = await this.roleRepository.findOne({where: {role_name}, rejectOnEmpty: true});
        return role;
    }
}
