import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {LessonsService} from "./lessons.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Lesson} from "./lessons.model";
import {CreateLessonDto} from "./dto/create-lesson.dto";

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonService: LessonsService) {}

    @ApiOperation({ summary: 'Создание урока' })
    @ApiResponse({ status: 200, type: Lesson })
    @Post()
    async createLesson(@Body() dto: CreateLessonDto): Promise<Lesson> {
        return this.lessonService.createLesson(dto);
    }

    @ApiOperation({ summary: 'Получение уроков по ID курса' })
    @ApiResponse({ status: 200, type: [Lesson] })
    @Get('course/:course_id')
    async getLessonsByCourseId(@Param('course_id') course_id: number): Promise<Lesson[]> {
        return this.lessonService.getLessonsByCourseId(course_id);
    }

    @ApiOperation({ summary: 'Получение уроков по ID модуля' })
    @ApiResponse({ status: 200, type: [Lesson] })
    @Get('module/:module_id')
    async getLessonsByModuleId(@Param('module_id') module_id: number): Promise<Lesson[]> {
        return this.lessonService.getLessonsByModuleId(module_id);
    }
}
