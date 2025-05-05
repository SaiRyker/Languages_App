import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {CoursesService} from "./courses.service";
import {CreateCourseDto} from "./dto/create-course.dto";
import {Course} from "./courses.model";

@Controller('courses')
export class CoursesController {
    constructor(private coursesService: CoursesService) {}

    @Post()
    async createCourse(@Body() dto: CreateCourseDto): Promise<Course> {
        return this.coursesService.createCourse(dto);
    }

    @Get('language/:lang_id')
    async getCoursesByLanguage(@Param('lang_id') lang_id: number): Promise<Course[]> {
        return this.coursesService.getCoursesByLang(lang_id);
    }

    @Get()
    async getAllCourses(): Promise<Course[]> {
        return this.coursesService.getAllCourses();
    }
}
