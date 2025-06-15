import {forwardRef, Module} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import {SequelizeModule} from "@nestjs/sequelize";
import {User} from "./user.model";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";
import {RolesModule} from "../roles/roles.module";
import {AuthModule} from "../auth/auth.module";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {SuppResps} from "../supp_resps/supp_resps.model";
import {StudentGroupsModule} from "../student_groups/student_groups.module";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [
      SequelizeModule.forFeature([User, Role, UserRoles, SuppReqs, SuppResps]),
      RolesModule,
      forwardRef(() => AuthModule),
      StudentGroupsModule
  ],
    exports: [
        UsersService,
    ]
})
export class UsersModule {}
