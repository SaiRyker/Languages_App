import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {TestSolutionsService} from "./test_solutions.service";
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {TSolution} from "./test_solutions.model";

@Controller('tsolutions')
export class TestSolutionsController {
    constructor(private testSolutionsService: TestSolutionsService) {}

    @ApiOperation({ summary: 'Сохранение решения пользователя' })
    @ApiResponse({ status: 200, type: TSolution })
    @Post()
    async saveUserSolution(@Body() dto: { testTaskId: number; userId: number; userAnswer: any[] },): Promise<TSolution> {
        return this.testSolutionsService.saveUserSolution(dto.testTaskId, dto.userId, dto.userAnswer);
    }

    @ApiOperation({ summary: 'Получение всех решений пользователя' })
    @ApiResponse({ status: 200, type: [TSolution] })
    @Get('/user/:userId')
    async getUserSolutionsByUserId(@Param('userId') userId: number): Promise<TSolution[]> {
        return this.testSolutionsService.getUserSolutionsByUserId(userId);
    }

    @ApiOperation({ summary: 'Получение решения пользователя' })
    @ApiResponse({ status: 200, type: TSolution })
    @Get(':testTaskId/:userId')
    async getUserSolution(@Param('testTaskId') testTaskId: number,@Param('userId') userId: number,
    ): Promise<TSolution | null> {
        return this.testSolutionsService.getUserSolution(testTaskId, userId);
    }
}
