import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Material} from "./lesson_materials.model";
import {CreateMaterialDto} from "./dto/create-material.dto";
import {Lesson} from "../lessons/lessons.model";

@Injectable()
export class LessonMaterialsService {
    constructor(@InjectModel(Material) private materialRep: typeof Material,
                @InjectModel(Lesson) private lessonRep: typeof Lesson,) {}

    async createMaterial(dto: CreateMaterialDto): Promise<Material> {
        if (!dto.lesson_id) {
            throw new NotFoundException("Lesson not found");
        }

        const material = await this.materialRep.create(dto);
        return material;
    }

    async getMaterialsByLessonId(lesson_id: number): Promise<Material[]> {
        if (!lesson_id) {
            throw new NotFoundException("Lesson not found");
        }

        const lesson = await this.lessonRep.findByPk(lesson_id);

        if (!lesson) {
            throw new NotFoundException("Materials for this lesson are not found");
        }

        const materials = await this.materialRep.findAll({
            where: { lesson_id: lesson_id },
            order: [['id_material', 'ASC']],
        });

        if (!materials || materials.length === 0) {
            return [];
        }

        return materials;
    }

}
