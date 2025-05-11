import { Module } from '@nestjs/common';
import { LessonMaterialsService } from './lesson_materials.service';
import { LessonMaterialsController } from './lesson_materials.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Lesson} from "../lessons/lessons.model";
import {CModule} from "../course_modules/course_modules.model";
import {Material} from "./lesson_materials.model";

@Module({
  providers: [LessonMaterialsService],
  controllers: [LessonMaterialsController],
  imports: [
    SequelizeModule.forFeature([Material, Lesson])
  ],
  exports: [
    LessonMaterialsService
  ]
})
export class LessonMaterialsModule {}
