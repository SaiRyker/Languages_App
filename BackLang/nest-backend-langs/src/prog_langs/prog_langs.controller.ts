import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ProgLangsService} from "./prog_langs.service";
import {Language} from "./prog_langs.model";
import {CreateLanguageDto} from "./dto/create-lang.dto";

@Controller('languages')
export class ProgLangsController {
    constructor(private progLangService: ProgLangsService) {}

    @Post()
    async createLanguage(@Body() dto: CreateLanguageDto): Promise<Language> {
        return this.progLangService.createLanguage(dto);
    }

    @Get()
    async getAllLanguages(): Promise<Language[]> {
        return this.progLangService.getAllLanguages();
    }
}
