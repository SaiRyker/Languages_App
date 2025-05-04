import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {SuppRespsService} from "./supp_resps.service";
import {CreateResponDto} from "./dto/create-respon.dto";
import {SuppResps} from "./supp_resps.model";

@Controller('sresp')
export class SuppRespsController {

    constructor(private suppRespsService: SuppRespsService) {}

    @ApiOperation({ summary: 'Создание ответа на запросы из поддержки' })
    @ApiResponse({status: 200, type: SuppResps})
    @Post()
    create(@Body() suppRespDto: CreateResponDto) {
        return this.suppRespsService.createRequest(suppRespDto);
    }

    @ApiOperation({ summary: 'Получение всех ответов на определенный запрос' })
    @ApiResponse({status: 200, type: SuppResps})
    @Get('responds/:req_id')
    getForUser(@Param('req_id') req_id: number) {
        return this.suppRespsService.getUserRequests(req_id);
    }
}
