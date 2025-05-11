import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {CoursesService} from "../courses/courses.service";
import {CreateCourseDto} from "../courses/dto/create-course.dto";
import {Course} from "../courses/courses.model";
import {CourseModulesService} from "./course_modules.service";
import {CModule} from "./course_modules.model";
import {CreateModuleDto} from "./dto/create-module.dto";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";

@Controller('cmodules')
export class CourseModulesController {
    constructor(private moduleService: CourseModulesService) {}

    @ApiOperation({ summary: 'Создание модуля для курса' })
    @ApiResponse({ status: 200, type: CModule })
    @Post()
    async createModule(@Body() dto: CreateModuleDto): Promise<CModule> {
        return this.moduleService.createModule(dto)
    }

    @ApiOperation({ summary: 'Получение модулей курса по ID курса' })
    @ApiResponse({ status: 200, type: [CModule] })
    @Get('course/:course_id')
    async getModulesByCourseId(@Param('course_id') course_id: number) {
        console.log('Received courseId:', course_id);
        return this.moduleService.getModulesByCourseId(course_id);
    }

}
