import {forwardRef, Module} from '@nestjs/common';
import { UserProgressController } from './user_progress.controller';
import { UserProgressService } from './user_progress.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "../users/user.model";
import {Progress} from "./user_progress.model";
import {Course} from "../courses/courses.model";
import {TSolution} from "../test_solutions/test_solutions.model";
import {TestSolutionsModule} from "../test_solutions/test_solutions.module";
import {PrSolutionsModule} from "../pr_solutions/pr_solutions.module";
import {PrSolution} from "../pr_solutions/pr_solutions.model";
import {Lesson} from "../lessons/lessons.model";
import {CModule} from "../course_modules/course_modules.model";

@Module({
  controllers: [UserProgressController],
  providers: [UserProgressService],
  imports: [
    SequelizeModule.forFeature([Progress, User, Course, TSolution, PrSolution, Lesson, CModule]),
    forwardRef(() => TestSolutionsModule),
    PrSolutionsModule,
  ],
  exports: [
    UserProgressService
  ]
})
export class UserProgressModule {}
