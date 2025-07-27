import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Material} from "./lesson_materials.model";
import {CreateMaterialDto} from "./dto/create-material.dto";
import {Lesson} from "../lessons/lessons.model";
import {UpdateMaterialDto} from "./dto/update-material.dto";
import {Sequelize} from "sequelize-typescript";

@Injectable()
export class LessonMaterialsService {
    constructor(@InjectModel(Material) private materialRep: typeof Material,
                @InjectModel(Lesson) private lessonRep: typeof Lesson,
                private sequelize: Sequelize,) {}

    async createMaterial(dto: CreateMaterialDto): Promise<Material> {
        if (!dto.lesson_id) {
            throw new NotFoundException('Урок не найден');
        }

        const lesson = await this.lessonRep.findByPk(dto.lesson_id);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        const material = await this.materialRep.create(dto);
        return material;
    }

    async updateMaterial(materialId: number, dto: UpdateMaterialDto): Promise<Material> {
        const material = await this.materialRep.findByPk(materialId);
        if (!material) {
            throw new NotFoundException(`Material with ID ${materialId} not found`);
        }

        // Ignore id_material from DTO since materialId from URL is used
        const { id_material, ...updateData } = dto;
        return material.update(updateData);
    }

    async updateMaterialOrder(lessonId: number, materialOrder: { id_material: number; order_number: number }[]): Promise<{ message: string }> {
        console.log('updateMaterialOrder called with:', { lessonId, materialOrder });

        const lesson = await this.lessonRep.findByPk(lessonId);
        if (!lesson) {
            throw new NotFoundException('Урок не найден');
        }

        const materialIds = materialOrder.map((m) => m.id_material);
        const materials = await this.materialRep.findAll({
            where: { id_material: materialIds, lesson_id: lessonId },
        });
        console.log('Found materials:', materials.map(m => ({ id_material: m.id_material, order_number: m.order_number })));

        if (materials.length !== materialOrder.length) {
            throw new BadRequestException('Один или несколько материалов не принадлежат уроку или не существуют');
        }

        const orderNumbers = materialOrder.map((m) => m.order_number);
        if (new Set(orderNumbers).size !== orderNumbers.length) {
            throw new BadRequestException('Порядковые номера должны быть уникальными');
        }

        return await this.sequelize.transaction(async (transaction) => {
            const baseTempValue = -1000;
            for (let i = 0; i < materialOrder.length; i++) {
                const { id_material } = materialOrder[i];
                const tempOrderNumber = baseTempValue - i;
                console.log(`Assigning temp order_number ${tempOrderNumber} to id_material ${id_material}`);
                await this.materialRep.update(
                    { order_number: tempOrderNumber },
                    { where: { id_material }, transaction },
                );
            }

            for (const { id_material, order_number } of materialOrder) {
                console.log(`Assigning final order_number ${order_number} to id_material ${id_material}`);
                await this.materialRep.update(
                    { order_number },
                    { where: { id_material }, transaction },
                );
            }

            return { message: 'Порядок материалов обновлён' };
        });
    }

    async deleteMaterial(materialId: number): Promise<{ message: string }> {
        const material = await this.materialRep.findByPk(materialId);
        if (!material) {
            throw new NotFoundException(`Материал с ID ${materialId} не найден`);
        }

        await material.destroy();
        return { message: 'Материал удалён' };
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

        return materials.map((material) => material.get({ plain: true }));
    }

}
