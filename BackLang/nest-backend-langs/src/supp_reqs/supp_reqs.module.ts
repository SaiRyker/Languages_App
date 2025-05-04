import { Module } from '@nestjs/common';
import { SuppReqsService } from './supp_reqs.service';
import { SuppReqsController } from './supp_reqs.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {SuppReqs} from "./supp_reqs.model";
import {User} from "../users/user.model";

@Module({
  providers: [SuppReqsService],
  controllers: [SuppReqsController],
  imports: [
      SequelizeModule.forFeature([SuppReqs, User])
  ],
  exports: [SuppReqsService]
})
export class SuppReqsModule {}
