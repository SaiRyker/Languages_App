import {Body, Controller, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {CoursesService} from "./courses.service";
import {CreateCourseDto} from "./dto/create-course.dto";
import {Course} from "./courses.model";
import {GetUser} from "../common/decorators/user.decorator";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {RolesGuard} from "../auth/roles.guard";
import {Roles} from "../auth/roles-auth.decorator";
import {ApiBearerAuth, ApiOperation, ApiResponse} from "@nestjs/swagger";

@Controller('courses')
export class CoursesController {
    constructor(private coursesService: CoursesService) {}

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'teacher')
    async createCourse(@Body() dto: CreateCourseDto,@GetUser() user: any): Promise<Course> {
        return this.coursesService.createCourse(dto, user);
    }

    @Get('creator/:creatorId')
    async getCoursesByCreatorId(@Param('creatorId') creatorId: string): Promise<Course[]> {
        return this.coursesService.getCoursesByCreatorId(parseInt(creatorId));
    }

    @Get('language/:lang_id')
    async getCoursesByLanguage(@Param('lang_id') lang_id: number): Promise<Course[]> {
        return this.coursesService.getCoursesByLang(lang_id);
    }

    @ApiOperation({ summary: 'Получить курсы, созданные преподавателем' })
    @ApiResponse({ status: 200, description: 'Список курсов преподавателя' })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('teacher')
    @Get('teacher-courses')
    async getTeacherCourses(@Req() request) {
        return this.coursesService.getTeacherCourses(request.user.id);
    }

    @Get()
    async getAllCourses(): Promise<Course[]> {
        return this.coursesService.getAllCourses();
    }

    @Get(':course_id')
    async getCourseById(@Param('course_id') course_id: number): Promise<Course> {
        return this.coursesService.getCourseById(course_id)
    }



}
