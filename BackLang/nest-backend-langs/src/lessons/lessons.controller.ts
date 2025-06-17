import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {LessonsService} from "./lessons.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Lesson} from "./lessons.model";
import {CreateLessonDto} from "./dto/create-lesson.dto";
import {UpdateLessonOrderDto} from "./dto/update-lesson-order.dto";
import {UpdateLessonDto} from "./dto/update-lesson.dto";

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonService: LessonsService) {}

    @ApiOperation({ summary: 'Создание урока' })
    @ApiResponse({ status: 200, type: Lesson })
    @Post()
    async createLesson(@Body() dto: CreateLessonDto): Promise<Lesson> {
        return this.lessonService.createLesson(dto);
    }

    @ApiOperation({ summary: 'Обновить урок' })
    @ApiResponse({ status: 200, description: 'Урок обновлён', type: Lesson })
    // @ApiBearerAuth()
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles('admin', 'teacher')
    @Put(':lessonId')
    async updateLesson(@Param('lessonId') lessonId: number, @Body() updateLessonDto: UpdateLessonDto) {
        return this.lessonService.updateLesson(lessonId, updateLessonDto);
    }

    @ApiOperation({ summary: 'Удалить урок' })
    @ApiResponse({ status: 200, description: 'Урок удалён' })
    @Delete(':lessonId')
    async deleteLesson(@Param('lessonId') lessonId: number) {
        return this.lessonService.deleteLesson(lessonId);
    }

    @ApiOperation({ summary: 'Обновить порядок уроков в модуле' })
    @ApiResponse({ status: 200, description: 'Порядок уроков обновлён' })
    @Put('cmodule/:moduleId/order')
    async updateLessonOrder(@Param('moduleId') moduleId: number, @Body() updateLessonOrderDto: UpdateLessonOrderDto) {
        return this.lessonService.updateLessonOrder(moduleId, updateLessonOrderDto.lessonOrder);
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

    @ApiOperation({ summary: 'Получение урока по его ID' })
    @ApiResponse({ status: 200, type: [Lesson] })
    @Get('/:lesson_id')
    async getLessonById(@Param('lesson_id') lesson_id: number): Promise<Lesson> {
        return this.lessonService.getLessonById(lesson_id);
    }
}
