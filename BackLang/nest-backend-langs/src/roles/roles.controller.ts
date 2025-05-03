import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {RolesService} from "./roles.service";
import {CreateRoleDto} from "./dto/crete-role.dto";

@Controller('roles')
export class RolesController {
    constructor(private rolesService: RolesService) {}

    @Post()
    create(@Body() dto: CreateRoleDto) {
        return this.rolesService.createRole(dto)
    }

    @Get('/:role_name')
    getByValue(@Param('role_name') role_name: string) {
        return this.rolesService.getRoleByValue(role_name);
    }
}
