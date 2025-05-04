import { Module } from '@nestjs/common';
import { SuppRespsService } from './supp_resps.service';
import { SuppRespsController } from './supp_resps.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {User} from "../users/user.model";
import {SuppResps} from "./supp_resps.model";

@Module({
  providers: [SuppRespsService],
  controllers: [SuppRespsController],
  imports: [
    SequelizeModule.forFeature([SuppResps, SuppReqs, User])
  ],
  exports: [
      SuppRespsService,
  ]
})
export class SuppRespsModule {}
