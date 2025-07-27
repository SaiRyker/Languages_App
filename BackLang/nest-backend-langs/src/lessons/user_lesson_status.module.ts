import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserLessonStatus } from './user_lesson_status.model';
import { UserLessonStatusService } from './user_lesson_status.service';
import { UserLessonStatusController } from './user_lesson_status.controller';
import { Lesson } from '../lessons/lessons.model';
import { TSolution } from '../test_solutions/test_solutions.model';
import { PrSolution } from '../pr_solutions/pr_solutions.model';

@Module({
    imports: [
        SequelizeModule.forFeature([UserLessonStatus, Lesson, TSolution, PrSolution]),
    ],
    providers: [UserLessonStatusService],
    controllers: [UserLessonStatusController],
    exports: [UserLessonStatusService],
})
export class UserLessonStatusModule {}