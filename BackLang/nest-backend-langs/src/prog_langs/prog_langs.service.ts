import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
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

    async getLanguageById(language_id: number): Promise<Language> {
        const language = await this.langRep.findOne({
            where: {id_lang: language_id},
        })
        if (!language) {
            throw new NotFoundException(`Language with id ${language_id} not found`);
        }
        return language;
    }

    async getAllLanguages(): Promise<Language[]> {
        return this.langRep.findAll();
    }
}
