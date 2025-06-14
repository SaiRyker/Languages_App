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
import { ProgLangsModule } from './prog_langs/prog_langs.module';
import {Language} from "./prog_langs/prog_langs.model";
import { CoursesModule } from './courses/courses.module';
import { CourseModulesModule } from './course_modules/course_modules.module';
import { LessonsModule } from './lessons/lessons.module';
import { LessonMaterialsModule } from './lesson_materials/lesson_materials.module';
import { TestTasksModule } from './test_tasks/test_tasks.module';
import { PrTasksModule } from './pr_tasks/pr_tasks.module';
import { TestSolutionsModule } from './test_solutions/test_solutions.module';
import { PrSolutionsModule } from './pr_solutions/pr_solutions.module';
import { UserProgressModule } from './user_progress/user_progress.module';
import { StudentGroupsModule } from './student_groups/student_groups.module';
import {Course} from "./courses/courses.model";
import {CModule} from "./course_modules/course_modules.model";
import {Lesson} from "./lessons/lessons.model";
import {Material} from "./lesson_materials/lesson_materials.model";
import {TestTask} from "./test_tasks/test_tasks.model";
import {TSolution} from "./test_solutions/test_solutions.model";
import {PrTask} from "./pr_tasks/pr_tasks.model";
import {PrSolution} from "./pr_solutions/pr_solutions.model";
import {StudentGroup} from "./student_groups/student_groups.model";
import {GroupStudent} from "./student_groups/group-students.model";
import {Progress} from "./user_progress/user_progress.model";
import {GroupCourse} from "./student_groups/group-courses.model";

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
            models: [User, Role, UserRoles, Notification, SuppReqs, SuppResps, Language, Course, CModule, Lesson, Material,
            TestTask, TSolution, PrTask, PrSolution, StudentGroup, GroupStudent, Progress, GroupCourse],
            autoLoadModels: true,
            synchronize: true
        }),
        UsersModule,
        RolesModule,
        AuthModule,
        UserNotificationsModule,
        SuppReqsModule,
        SuppRespsModule,
        ProgLangsModule,
        CoursesModule,
        CourseModulesModule,
        LessonsModule,
        LessonMaterialsModule,
        TestTasksModule,
        PrTasksModule,
        TestSolutionsModule,
        PrSolutionsModule,
        UserProgressModule,
        StudentGroupsModule,
    ],
})
export class AppModule {}