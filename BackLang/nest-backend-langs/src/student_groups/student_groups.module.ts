import { Module } from '@nestjs/common';
import { StudentGroupsService } from './student_groups.service';
import { StudentGroupsController } from './student_groups.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {StudentGroup} from "./student_groups.model";
import {User} from "../users/user.model";
import {Course} from "../courses/courses.model";
import {GroupStudent} from "./group-students.model";
import {GroupCourse} from "./group-courses.model";
import {Progress} from "../user_progress/user_progress.model";
import {UserProgressModule} from "../user_progress/user_progress.module";

@Module({
  providers: [StudentGroupsService],
  controllers: [StudentGroupsController],
  imports: [
    SequelizeModule.forFeature([
      StudentGroup,
      GroupStudent,
      User,
      Course,
        GroupCourse,
    ]),
    UserProgressModule
  ],
  exports: [StudentGroupsService]
})
export class StudentGroupsModule {}
