import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Language} from "../prog_langs/prog_langs.model";
import {Course} from "./courses.model";
import {CModule} from "../course_modules/course_modules.model";
import {GroupCourse} from "../student_groups/group-courses.model";

@Module({
  providers: [CoursesService],
  controllers: [CoursesController],
  imports: [
    SequelizeModule.forFeature([Course, Language, CModule, GroupCourse])
  ],
  exports: [CoursesService],
})
export class CoursesModule {}
