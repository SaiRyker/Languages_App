import {Column, DataType, Model, Table} from "sequelize-typescript";
import {unique} from "sequelize-typescript/dist/shared/array";

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

    @Column({type: DataType.INTEGER, allowNull:true})
    id_role: number;
}