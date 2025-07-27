import {forwardRef, Module} from '@nestjs/common';
import { PrSolutionsService } from './pr_solutions.service';
import { PrSolutionsController } from './pr_solutions.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {PrTask} from "../pr_tasks/pr_tasks.model";
import {PrSolution} from "./pr_solutions.model";
import {User} from "../users/user.model";
import {Lesson} from "../lessons/lessons.model";
import {Language} from "../prog_langs/prog_langs.model";
import {PrTasksService} from "../pr_tasks/pr_tasks.service";
import {PrTasksModule} from "../pr_tasks/pr_tasks.module";
import {ProgLangsModule} from "../prog_langs/prog_langs.module";
import {CModule} from "../course_modules/course_modules.model";
import {UserProgressModule} from "../user_progress/user_progress.module";

@Module({
  providers: [PrSolutionsService],
  controllers: [PrSolutionsController],
  imports: [
    SequelizeModule.forFeature([PrTask, PrSolution, User, Lesson, Language, CModule]),
    PrTasksModule, ProgLangsModule,
    forwardRef(() => UserProgressModule),
  ],
  exports: [
    PrSolutionsService
  ]
})
export class PrSolutionsModule {}
