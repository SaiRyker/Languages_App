import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Course} from "../courses/courses.model";
import {CModule} from "../course_modules/course_modules.model";
import {Lesson} from "../lessons/lessons.model";

export enum mType {
    pText = 'Текст',
    pAudio = 'Аудио',
    pVideo = 'Видео'
}

interface MaterialCreationAttrs {
    lesson_id: number;
    material_type: mType;
    content?: string;
    url?: string;
}

@Table({tableName: 'lesson_materials'})
export class Material extends Model<Material, MaterialCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_material: number;

    @ForeignKey(() => Lesson)
    @Column({type: DataType.INTEGER, allowNull:false})
    lesson_id: number;

    @BelongsTo(() => Lesson)
    lesson: Lesson

    @Column({type: DataType.ENUM(...Object.values(mType)), allowNull:false, defaultValue: mType.pText})
    material_type: mType;

    @Column({type: DataType.TEXT, allowNull:true})
    content: string;

    @Column({type: DataType.STRING, allowNull:true})
    url: string;
}