import { Module } from '@nestjs/common';
import { PrSolutionsService } from './pr_solutions.service';
import { PrSolutionsController } from './pr_solutions.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {PrTask} from "../pr_tasks/pr_tasks.model";
import {PrSolution} from "./pr_solutions.model";
import {User} from "../users/user.model";

@Module({
  providers: [PrSolutionsService],
  controllers: [PrSolutionsController],
  imports: [
    SequelizeModule.forFeature([PrTask, PrSolution, User]),
  ],
})
export class PrSolutionsModule {}
