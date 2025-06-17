import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UsersService} from "./users.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {User} from "./user.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {Roles} from "../auth/roles-auth.decorator";
import {RolesGuard} from "../auth/roles.guard";
import {addRoleDto} from "../roles/dto/add-role.dto";
import {Request} from "express";
import {GetUser} from "../common/decorators/user.decorator";
import {StudentGroup} from "../student_groups/student_groups.model";
import {StudentGroupsService} from "../student_groups/student_groups.service";
import {Course} from "../courses/courses.model";

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService,
                private studentGroupsService: StudentGroupsService,) {}


    @ApiOperation({ summary: 'Создание пользователя' })
    @ApiResponse({status: 200, type: User})
    @Post()
    create(@Body() userDto: CreateUserDto) {
        console.log("Э")
        return this.usersService.createUser(userDto);
    }

    @ApiOperation({ summary: 'Получение всех пользователей' })
    @ApiResponse({status: 200, type: [User]})
    // @UseGuards(JwtAuthGuard)
    @Roles("teacher")
    @UseGuards(RolesGuard)
    @Get()
    getAll() {
        console.log("Ээ")
        return this.usersService.getAllUser();
    }

    @Get("students")
    async getAllStudents() {
        const students = await this.usersService.getAllStudents();
        console.log('Контроллер /users/students возвращает:', students);
        return students;
    }

    @ApiOperation({ summary: 'Выдать роль' })
    @ApiResponse({status: 200})
    // @UseGuards(JwtAuthGuard)
    @Roles("admin")
    @UseGuards(RolesGuard)
    @Post('/role')
    addRole(@Body() dto: addRoleDto) {
        console.log("Эээ")
        return this.usersService.addRole(dto);
    }

    @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
    @ApiResponse({ status: 200, type: User })
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@GetUser() user: any) {
        console.log("Ээээ")
        if (!user || !user.email) {
            throw new Error('User data not found');
        }
        return this.usersService.getUserByEmail(user.email);
    }

    @ApiOperation({ summary: 'Получение пользователя по ID' })
    @ApiResponse({ status: 200, type: User })
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    getUserById(@GetUser() user: any) {
        console.log("Эээээ")
        if (!user || !user.id) {
            throw new Error('User data not found');
        }
        return this.usersService.getUserById(user.id);
    }

    @ApiOperation({ summary: 'Получение курсов текущего пользователя' })
    @ApiResponse({ status: 200, type: [Course] })
    @UseGuards(JwtAuthGuard)
    @Get('profile/courses')
    async getUserCourses(@GetUser() user: any) {
        console.log("Ээээээ")
        if (!user || !user.id) {
            throw new Error('User data not found');
        }
        return this.usersService.getUserCourses(user.id);
    }

    @ApiOperation({ summary: 'Получение групп текущего пользователя' })
    @ApiResponse({ status: 200, type: [StudentGroup] })
    @UseGuards(JwtAuthGuard)
    @Get('profile/groups')
    async getUserGroups(@GetUser() user: any) {
        console.log('User in getUserGroups:', user);
        if (!user || !user.id) {
            throw new Error('User data not found');
        }
        return this.usersService.getUserGroups(user.id);
    }




}
