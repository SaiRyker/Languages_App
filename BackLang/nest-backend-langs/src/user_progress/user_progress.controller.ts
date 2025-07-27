import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UserProgressService } from './user_progress.service';
import { Progress } from './user_progress.model';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User Progress')
@Controller('user-progress')
export class UserProgressController {
    constructor(private readonly userProgressService: UserProgressService) {}

    @ApiOperation({ summary: 'Создание прогресса для студента' })
    @ApiResponse({ status: 201, type: Progress })
    @Post()
    async createProgress(@Body() body: { studentId: number; courseId: number }): Promise<Progress> {
        return this.userProgressService.createProgressForStudent(body.studentId, body.courseId);
    }

    @ApiOperation({ summary: 'Создание прогресса для группы студентов' })
    @ApiResponse({ status: 201, type: [Progress] })
    @Post('bulk')
    async createProgressForStudents(@Body() body: { studentIds: number[]; courseId: number }): Promise<Progress[]> {
        return this.userProgressService.createProgressForStudents(body.studentIds, body.courseId);
    }

    @ApiOperation({ summary: 'Обновление прогресса студента по курсу' })
    @ApiResponse({ status: 200, type: Progress })
    @Post('update')
    async updateProgress(@Body() body: { studentId: number; courseId: number }): Promise<Progress> {
        return this.userProgressService.updateProgress(body.studentId, body.courseId);
    }

    @ApiOperation({ summary: 'Получение прогресса пользователей по курсам преподавателя' })
    @ApiResponse({ status: 200, type: [Progress] })
    @Get('creator/:creatorId')
    async getProgressByCreator(@Param('creatorId') creatorId: number, @Query('courseId') courseId?: number,): Promise<Progress[]> {
        return this.userProgressService.getProgressByCourseAndCreator(creatorId, courseId);
    }

    @ApiOperation({ summary: 'Получение прогресса студента по курсу' })
    @ApiResponse({ status: 200, type: Progress })
    @Get(':studentId/:courseId')
    async getProgressByStudentAndCourse(@Param('studentId') studentId: number, @Param('courseId') courseId: number,): Promise<Progress> {
        return this.userProgressService.getProgressByStudentAndCourse(studentId, courseId);
    }
}