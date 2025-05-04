import {Module} from "@nestjs/common";
import {SequelizeModule} from "@nestjs/sequelize";
import { UsersModule } from './users/users.module';
import {ConfigModule} from "@nestjs/config";
import * as process from "node:process";
import {User} from "./users/user.model";
import { RolesModule } from './roles/roles.module';
import {Role} from "./roles/roles.model";
import {UserRoles} from "./roles/user-roles.model";
import { AuthModule } from './auth/auth.module';
import { UserNotificationsModule } from './user_notifications/user_notifications.module';
import {Notification} from "./user_notifications/user_notifications.model";
import { SuppReqsModule } from './supp_reqs/supp_reqs.module';
import { SuppRespsModule } from './supp_resps/supp_resps.module';
import {SuppReqs} from "./supp_reqs/supp_reqs.model";
import {SuppResps} from "./supp_resps/supp_resps.model";

@Module({
    controllers: [],
    providers: [],
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [User, Role, UserRoles, Notification, SuppReqs, SuppResps],
            autoLoadModels: true,
        }),
        UsersModule,
        RolesModule,
        AuthModule,
        UserNotificationsModule,
        SuppReqsModule,
        SuppRespsModule,
    ],
})
export class AppModule {}