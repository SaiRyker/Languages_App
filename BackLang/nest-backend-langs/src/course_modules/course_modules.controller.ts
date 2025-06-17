import {Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards} from '@nestjs/common';
import {CoursesService} from "../courses/courses.service";
import {CreateCourseDto} from "../courses/dto/create-course.dto";
import {Course} from "../courses/courses.model";
import {CourseModulesService} from "./course_modules.service";
import {CModule} from "./course_modules.model";
import {CreateModuleDto} from "./dto/create-module.dto";
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles-auth.decorator";
import {UpdateModuleDto} from "./dto/update-module.dto";
import {UpdateModuleOrderDto} from "./dto/update-module-order.dto";

@Controller('cmodules')
export class CourseModulesController {
    constructor(private moduleService: CourseModulesService) {}

    @ApiOperation({ summary: 'Создать модуль' })
    @ApiResponse({ status: 201, description: 'Модуль создан' })
    @Post()
    async createModule(@Body() dto: CreateModuleDto): Promise<CModule> {
        return this.moduleService.createModule(dto)
    }

    @ApiOperation({ summary: 'Обновить модуль' })
    @ApiResponse({ status: 200, description: 'Модуль обновлён' })
    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('admin', 'teacher')
    @Put(':moduleId')
    async updateModule(@Param('moduleId') moduleId: number, @Body() updateModuleDto: UpdateModuleDto) {
        return this.moduleService.updateModule(moduleId, updateModuleDto);
    }

    @ApiOperation({ summary: 'Удалить модуль' })
    @ApiResponse({ status: 200, description: 'Модуль удалён' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'teacher')
    @Delete(':moduleId')
    async deleteModule(@Param('moduleId') moduleId: number) {
        return this.moduleService.deleteModule(moduleId);
    }

    @ApiOperation({ summary: 'Обновить порядок модулей' })
    @ApiResponse({ status: 200, description: 'Порядок модулей обновлён' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'teacher')
    @Put('course/:courseId/order')
    async updateModuleOrder(@Param('courseId') courseId: number, @Body() updateModuleOrderDto: UpdateModuleOrderDto) {
        return this.moduleService.updateModuleOrder(courseId, updateModuleOrderDto.moduleOrder);
    }



    @ApiOperation({ summary: 'Получение модулей курса по ID курса' })
    @ApiResponse({ status: 200, type: [CModule] })
    @Get('course/:course_id')
    async getModulesByCourseId(@Param('course_id') course_id: number) {
        console.log('Received courseId:', course_id);
        return this.moduleService.getModulesByCourseId(course_id);
    }



}