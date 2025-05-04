import {BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {User} from "../users/user.model";

interface RespCreationAttrs {
    req_id: number;
    responder_id: number;
    content: string;
}

@Table({tableName: 'supp_responses', updatedAt: false})
export class SuppResps extends Model<SuppResps, RespCreationAttrs> {

    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_resp: number;

    @ForeignKey(() => SuppReqs)
    @Column({type: DataType.INTEGER, allowNull:false})
    req_id: string;

    @BelongsTo(() => SuppReqs)
    request: SuppReqs

    @ForeignKey(() => User)
    @Column({type: DataType.INTEGER, allowNull:false})
    responder_id: User;

    @BelongsTo(() => User)
    user: User

    @Column({type: DataType.STRING, allowNull:false})
    content: string;
}