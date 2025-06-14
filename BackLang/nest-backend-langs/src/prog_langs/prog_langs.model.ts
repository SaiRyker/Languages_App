import { Column, DataType, Model, Table} from "sequelize-typescript";


interface LangCreationAttrs {
    lang_name: string;
    description: string;
}

@Table({tableName: 'languages'})
export class Language extends Model<Language, LangCreationAttrs> {
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id_lang: number;

    @Column({type: DataType.STRING, unique: true, allowNull:false})
    lang_name: string;

    @Column({type: DataType.STRING, allowNull:true})
    description: string;

}