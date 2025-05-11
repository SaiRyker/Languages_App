import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {TestTasksService} from "./test_tasks.service";
import {TestTask} from "./test_tasks.model";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {CreateTaskDto} from "./dto/create-task.dto";
import {CheckAnswerDto} from "./dto/check-answer.dto";

@Controller('tests')
export class TestTasksController {
    constructor(private testTasksService: TestTasksService) {}

    @ApiOperation({ summary: 'Создание тестового задания' })
    @ApiResponse({ status: 200, type: TestTask })
    @Post()
    async createTestTask(@Body() dto: CreateTaskDto): Promise<TestTask> {
        return this.testTasksService.createTestTask(dto);
    }

    @ApiOperation({ summary: 'Получение всех тестовых заданий по ID курса' })
    @ApiResponse({ status: 200, type: [TestTask] })
    @Get('course/:course_id')
    async getAllCourseTestTasksByCId(@Param('course_id') course_id: number): Promise<TestTask[]> {
        return this.testTasksService.getAllCourseTestTasksByCId(course_id);
    }

    @ApiOperation({ summary: 'Проверка ответа пользователя на тестовое задание' })
    @ApiResponse({ status: 200, type: Object })
    @Post('check-answer')
    async checkAnswer(@Body() dto: CheckAnswerDto): Promise<{ isCorrect: boolean }> {
        return this.testTasksService.checkAnswer(dto);
    }

}
