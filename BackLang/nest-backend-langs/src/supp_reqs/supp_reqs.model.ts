import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {User} from "../users/user.model";

export enum SupportRequestStatus {
    PENDING = 'На рассмотрении',
    RESOLVED = 'Решен'
}

interface SuppReqsCreationAttrs {
    user_id: number;
    subject: string;
    description: string;
    status?: string;
}

@Table({tableName: 'supp_requests',})
export class SuppReqs extends Model<SuppReqs, SuppReqsCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_req: number;

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull:false})
    user_id: string;

    @BelongsTo(() => User)
    user: User

    @Column({type: DataType.STRING(255), allowNull:false})
    subject: string;

    @Column({type: DataType.TEXT, allowNull:false})
    description: string;

    @Column({type: DataType.ENUM(...Object.values(SupportRequestStatus)), allowNull:false,
    defaultValue: SupportRequestStatus.PENDING})
    status: SupportRequestStatus;
}