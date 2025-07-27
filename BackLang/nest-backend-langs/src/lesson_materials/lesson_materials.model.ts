import {BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table} from "sequelize-typescript";
import {Lesson} from "../lessons/lessons.model";

export enum mType {
    pText = 'Текст',
    pVideo = 'Видео',
    pImage = 'Изображение'
}

interface MaterialCreationAttrs {
    lesson_id: number;
    material_type: mType;
    content: string;
    order_number: number;
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

    @Column({ type: DataType.STRING, allowNull: true })
    title: string;

    @Column({type: DataType.TEXT, allowNull:true})
    content: string;

    @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
    order_number: number;

    @Column({type: DataType.STRING, allowNull:true})
    url: string;
}