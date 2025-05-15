import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Course} from "./courses.model";
import {CreateCourseDto} from "./dto/create-course.dto";
import {Language} from "../prog_langs/prog_langs.model";
import {CModule} from "../course_modules/course_modules.model";
import {Lesson} from "../lessons/lessons.model";

@Injectable()
export class CoursesService {
    constructor(@InjectModel(Course) private courseRep: typeof Course) {}

    async createCourse(dto: CreateCourseDto): Promise<Course> {
        const course = await this.courseRep.create(dto);
        return course;
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
}
