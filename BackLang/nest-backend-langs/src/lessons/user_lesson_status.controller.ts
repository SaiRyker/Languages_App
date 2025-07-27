import { Controller, Get, Post, Put, Query, Param, Body, UseGuards, Logger, HttpException, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserLessonStatusService } from './user_lesson_status.service';
import { CreateLessonStatusDto } from './dto/create-lesson-status.dto';
import { UpdateLessonStatusDto } from './dto/update-lesson-status.dto';

@Controller('lessonStatus')
export class UserLessonStatusController {
    private readonly logger = new Logger(UserLessonStatusController.name);

    constructor(private readonly userLessonStatusService: UserLessonStatusService) {}

    @Get()
    async getStatus(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('lessonId', ParseIntPipe) lessonId: number,
    ) {
        this.logger.log(`Handling GET /lessonStatus?userId=${userId}&lessonId=${lessonId}`);
        try {
            const status = await this.userLessonStatusService.getStatus(userId, lessonId);
            return status;
        } catch (error) {
            this.logger.error(`Error fetching status: ${error.message}`, error.stack);
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Get('module')
    async getStatusesForModule(
        @Query('userId', ParseIntPipe) userId: number,
        @Query('moduleId', ParseIntPipe) moduleId: number,
    ) {
        this.logger.log(`Handling GET /user-lesson-status/module?userId=${userId}&moduleId=${moduleId}`);
        try {
            const statuses = await this.userLessonStatusService.getStatusesForModule(userId, moduleId);
            return statuses;
        } catch (error) {
            this.logger.error(`Error fetching module statuses: ${error.message}`, error.stack);
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Post()
    async createStatus(@Body() dto: CreateLessonStatusDto) {
        this.logger.log(`Handling POST /lessonStatus for user ${dto.user_id}, lesson ${dto.lesson_id}`);
        try {
            const status = await this.userLessonStatusService.createStatus(dto);
            return status;
        } catch (error) {
            this.logger.error(`Error creating status: ${error.message}`, error.stack);
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }

    @Put(':lessonId')
    async updateStatus(
        @Param('lessonId', ParseIntPipe) lessonId: number,
        @Body() dto: UpdateLessonStatusDto,
        @Query('userId', ParseIntPipe) userId: number,
    ) {
        this.logger.log(`Handling PUT /lessonStatus/${lessonId} for user ${userId}, status: ${dto.status}`);
        try {
            const status = await this.userLessonStatusService.updateStatus(userId, lessonId, dto.status);
            return status;
        } catch (error) {
            this.logger.error(`Error updating status: ${error.message}`, error.stack);
            throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
        }
    }
}