import {BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Course} from "./courses.model";
import {CreateCourseDto} from "./dto/create-course.dto";
import {Language} from "../prog_langs/prog_langs.model";
import {CModule} from "../course_modules/course_modules.model";
import {Lesson} from "../lessons/lessons.model";
import {JwtService} from "@nestjs/jwt";
import {User} from "../users/user.model";
import {GetUser} from "../common/decorators/user.decorator";
import {Role} from "../roles/roles.model";
import { Sequelize } from 'sequelize-typescript';
import {BatchUpdateCourseDto} from "./dto/batch-update-course.dto";

@Injectable()
export class CoursesService {
    constructor(@InjectModel(Course) private courseRep: typeof Course,
                private jwtService: JwtService,
                @InjectModel(User) private userRep: typeof User,
                private sequelize: Sequelize,
                ) {}

    async createCourse(dto: CreateCourseDto, @GetUser() user: any): Promise<Course> {
        let userId: number;

        // Пробуем получить userId из @GetUser
        if (user && user.id) {
            userId = user.id;
        } else {
            throw new HttpException('Пользователь не авторизован', HttpStatus.UNAUTHORIZED);
        }

        // Проверяем пользователя в базе
        const dbUser = await this.userRep.findByPk(userId, {
            include: [{ model: Role, as: 'roles' }],
        });
        if (dbUser instanceof User) {
            console.log("Роил пользоваотеля", dbUser.get("roles").map(role => role.get("role_name")));
        }
        if (!dbUser) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }

        // Проверяем роли
        const userRoles = dbUser.get("roles").map((role) => role.get("role_name"));
        console.log('User roles:', userRoles);
        if (!userRoles.includes('admin') && !userRoles.includes('teacher')) {
            throw new HttpException(
                'Только администраторы или преподаватели могут создавать курсы',
                HttpStatus.FORBIDDEN,
            );
        }

        // Создаём курс
        try {
            const course = await this.courseRep.create({ ...dto, creator_id: userId });
            return course;
        } catch (e) {
            console.error('Ошибка создания курса:', e);
            throw new HttpException('Ошибка создания курса', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getCoursesByCreatorId(creatorId: number): Promise<Course[]> {
        const courses = await this.courseRep.findAll({
            where: { creator_id: creatorId },
            include: [
                {
                    model: Language,
                    attributes: ['lang_name'],
                },
            ],
        });
        return courses;
    }

    async getCoursesByLang(lang_id: number): Promise<Course[]> {
        const courses = await this.courseRep.findAll({
            where: {lang_id: lang_id},
            include: [
                {
                    model: Language,
                    attributes: ['lang_name'],
                },
            ]
        });
        if (!courses) {
            throw new NotFoundException(`No courses found for language with id ${lang_id}`);
        }

        return courses;
    }

    async getAllCourses(): Promise<Course[]> {
        return this.courseRep.findAll({
            include: [
                {
                    model: Language,
                    attributes: ['lang_name'],
                },
            ],
        });
    }

    async getCourseById(courseId: number): Promise<Course> {
        const course = await this.courseRep.findByPk(courseId, {
            include: [
                {
                    model: Language,
                    attributes: ['lang_name'],
                },
                {
                    model: CModule,
                    include: [{model: Lesson}]
                }
            ],
        });
        if (!course) {
            throw new NotFoundException(`Course with id ${courseId} not found`);
        }
        return course;
    }

    async getTeacherCourses(userId: number): Promise<Course[]> {
        const courses = await this.courseRep.findAll({
            where: { creator_id: userId },
            include: [{ model: Language, as: 'language' }],
        });
        console.log(courses)
        return courses || [];
    }


}
