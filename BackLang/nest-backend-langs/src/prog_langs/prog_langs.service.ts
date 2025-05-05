import {ConflictException, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Model} from "sequelize-typescript";
import {Language} from "./prog_langs.model";
import {CreateLanguageDto} from "./dto/create-lang.dto";

@Injectable()
export class ProgLangsService {
    constructor(@InjectModel(Language) private langRep: typeof Language,) {}

    async createLanguage(dto: CreateLanguageDto) {
        try {
            const language = await this.langRep.create({
                lang_name: dto.lang_name,
                description: dto.description,
            });
            return language;
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictException(`Language with name "${dto.lang_name}" already exists`);
            }
            throw error;
        }
    }

    async getAllLanguages(): Promise<Language[]> {
        return this.langRep.findAll();
    }
}
