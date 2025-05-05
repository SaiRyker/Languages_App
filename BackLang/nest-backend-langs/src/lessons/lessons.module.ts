import { Module } from '@nestjs/common';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {CModule} from "../course_modules/course_modules.model";
import {Course} from "../courses/courses.model";
import {Lesson} from "./lessons.model";
import {TestTask} from "../test_tasks/test_tasks.model";
import {PrTask} from "../pr_tasks/pr_tasks.model";

@Module({
  controllers: [LessonsController],
  providers: [LessonsService],
  imports: [
    SequelizeModule.forFeature([Lesson, CModule, TestTask, PrTask])
  ],
  exports: [LessonsService],
})
export class LessonsModule {}
