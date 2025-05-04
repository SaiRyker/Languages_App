import { Module } from '@nestjs/common';
import { SuppReqsService } from './supp_reqs.service';
import { SuppReqsController } from './supp_reqs.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {SuppReqs} from "./supp_reqs.model";
import {User} from "../users/user.model";
import {SuppResps} from "../supp_resps/supp_resps.model";

@Module({
  providers: [SuppReqsService],
  controllers: [SuppReqsController],
  imports: [
      SequelizeModule.forFeature([SuppResps, SuppReqs, User])
  ],
  exports: [SuppReqsService]
})
export class SuppReqsModule {}
