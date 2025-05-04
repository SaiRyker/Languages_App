import {Body, Controller, Get, Post, UseGuards} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UsersService} from "./users.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {User} from "./user.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/roles.guard";
import {addRoleDto} from "../roles/dto/add-role.dto";

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) {}


    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({status: 200, type: User})
    @Post()
    create(@Body() userDto: CreateUserDto) {
        return this.usersService.createUser(userDto);
    }

    @ApiOperation({ summary: 'Получение всех пользователей' })
    @ApiResponse({status: 200, type: [User]})
    // @UseGuards(JwtAuthGuard)
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Get()
    getAll() {
        return this.usersService.getAllUser();
    }

    @ApiOperation({ summary: 'Выдать роль' })
    @ApiResponse({status: 200})
    // @UseGuards(JwtAuthGuard)
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Post('/role')
    addRole(@Body() dto: addRoleDto) {
        return this.usersService.addRole(dto);
    }
}
