import {BelongsToMany, Column, DataType, HasMany, Model, Table} from "sequelize-typescript";
import {Role} from "../roles/roles.model";
import {UserRoles} from "../roles/user-roles.model";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {Notification} from "../user_notifications/user_notifications.model";
import {SuppResps} from "../supp_resps/supp_resps.model";

interface UserCreationAttrs {
    user_login: string;
    user_email: string;
    user_password: string;
}

@Table({tableName: 'users'})
export class User extends Model<User, UserCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_user: number;

    @Column({type: DataType.STRING, unique: true, allowNull:false})
    user_login: string;

    @Column({type: DataType.STRING, unique: true, allowNull:false})
    user_email: string;

    @Column({type: DataType.STRING, allowNull:false})
    user_password: string;

    @Column({type: DataType.DATE, allowNull:true})
    registration_date: Date;

    @Column({type: DataType.STRING, allowNull:true})
    user_fio: string;

    @BelongsToMany(() => Role, () => UserRoles)
    roles: Role[];

    @HasMany(() => SuppReqs, 'user_id')
    supportRequests: SuppReqs[];

    @HasMany(() => SuppResps, 'responder_id')
    supportResponses: SuppResps[];

    @HasMany(() => Notification, 'user_id')
    notifications: Notification[];
}