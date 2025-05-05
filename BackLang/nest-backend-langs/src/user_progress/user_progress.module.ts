import { Module } from '@nestjs/common';
import { UserProgressController } from './user_progress.controller';
import { UserProgressService } from './user_progress.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "../users/user.model";
import {Progress} from "./user_progress.model";
import {Course} from "../courses/courses.model";

@Module({
  controllers: [UserProgressController],
  providers: [UserProgressService],
  imports: [
    SequelizeModule.forFeature([Progress, User, Course]),
  ],
  exports: [
    UserProgressService
  ]
})
export class UserProgressModule {}
