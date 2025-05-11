import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {CModule} from "./course_modules.model";
import {CreateModuleDto} from "./dto/create-module.dto";
import {CreateCourseDto} from "../courses/dto/create-course.dto";
import {Course} from "../courses/courses.model";

@Injectable()
export class CourseModulesService {
    constructor(@InjectModel(CModule) private moduleRep: typeof CModule,
                @InjectModel(Course) private courseRep: typeof Course) {}

    async createModule(dto: CreateModuleDto) {
        const course = await this.courseRep.findByPk(dto.course_id);
        if (!course) {
            throw new NotFoundException(`Course with id ${dto.course_id} not found`);
        }

        const module = await this.moduleRep.create(dto);
        return module;
    }

    async getModulesByCourseId(course_id: number): Promise<CModule[]> {
        if (course_id === undefined) {
            throw new NotFoundException(`Undefined parameter ${course_id}`);
        }
        const course = await this.courseRep.findByPk(course_id);
        if (!course) {
            throw new NotFoundException(`Course with id ${course_id} not found`);
        }

        const modules = await this.moduleRep.findAll({
            where: { course_id: course_id },
            order: [['order_number', 'ASC']],
        });
        return modules;
    }
}
