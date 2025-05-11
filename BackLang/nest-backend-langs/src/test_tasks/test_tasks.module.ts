import {forwardRef, Module} from '@nestjs/common';
import { TestTasksController } from './test_tasks.controller';
import { TestTasksService } from './test_tasks.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {TestTask} from "./test_tasks.model";
import {Lesson} from "../lessons/lessons.model";
import {TSolution} from "../test_solutions/test_solutions.model";
import {CModule} from "../course_modules/course_modules.model";

@Module({
  controllers: [TestTasksController],
  providers: [TestTasksService],
  imports: [
    SequelizeModule.forFeature([TestTask, Lesson, TSolution, CModule,]),
  ],
  exports: [
    TestTasksService
  ]
})
export class TestTasksModule {}
