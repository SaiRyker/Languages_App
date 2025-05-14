import { Module } from '@nestjs/common';
import { ProgLangsService } from './prog_langs.service';
import { ProgLangsController } from './prog_langs.controller';
import {SequelizeModule} from "@nestjs/sequelize";
import {Language} from "./prog_langs.model";

@Module({
  providers: [ProgLangsService],
  controllers: [ProgLangsController],
  imports: [
    SequelizeModule.forFeature([Language])
  ],
  exports: [
    ProgLangsService
  ]
})
export class ProgLangsModule {}
