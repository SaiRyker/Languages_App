import { Module, forwardRef } from '@nestjs/common';
import { TestSolutionsController } from './test_solutions.controller';
import { TestSolutionsService } from './test_solutions.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestTask } from '../test_tasks/test_tasks.model';
import { Lesson } from '../lessons/lessons.model';
import { TSolution } from './test_solutions.model';
import { User } from '../users/user.model';
import { CModule } from '../course_modules/course_modules.model';
import { TestTasksModule } from '../test_tasks/test_tasks.module';
import { UserProgressModule } from '../user_progress/user_progress.module';

@Module({
  controllers: [TestSolutionsController],
  providers: [TestSolutionsService],
  imports: [
    SequelizeModule.forFeature([TSolution, TestTask, User, Lesson, CModule]),
    TestTasksModule,
    forwardRef(() => UserProgressModule),
  ],
  exports: [TestSolutionsService],
})
export class TestSolutionsModule {}