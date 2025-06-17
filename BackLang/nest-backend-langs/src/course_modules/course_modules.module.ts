import { Module } from '@nestjs/common';
import { CourseModulesService } from './course_modules.service';
import { CourseModulesController } from './course_modules.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {CModule} from "./course_modules.model";
import {Course} from "../courses/courses.model";
import {Lesson} from "../lessons/lessons.model";
import {JwtModule, JwtService} from "@nestjs/jwt";
import process from "node:process";

@Module({
  providers: [CourseModulesService],
  controllers: [CourseModulesController],
  imports: [
    SequelizeModule.forFeature([CModule, Course, Lesson]),
    JwtModule.register({
      secret: process.env.JWT_TOKEN || 'SECRET',
      signOptions: {
        expiresIn: '24h',
      }
    })
  ],
  exports: [
    CourseModulesService
  ]
})
export class CourseModulesModule {}
