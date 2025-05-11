import { Module } from '@nestjs/common';
import { CourseModulesService } from './course_modules.service';
import { CourseModulesController } from './course_modules.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {CModule} from "./course_modules.model";
import {Course} from "../courses/courses.model";
import {Lesson} from "../lessons/lessons.model";

@Module({
  providers: [CourseModulesService],
  controllers: [CourseModulesController],
  imports: [
    SequelizeModule.forFeature([CModule, Course, Lesson])
  ],
  exports: [
    CourseModulesService
  ]
})
export class CourseModulesModule {}
