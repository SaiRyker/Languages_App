import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {ApiOperation, ApiResponse} from "@nestjs/swagger";
import {Notification} from "../user_notifications/user_notifications.model";
import {CreateNotifDto} from "../user_notifications/dto/create-notif.dto";
import {SuppReqsService} from "./supp_reqs.service";
import {SuppReqs} from "./supp_reqs.model";
import {CreateSupportRequestDto} from "./dto/create-suppreq.dto";

@Controller('sreq')
export class SuppReqsController {

    constructor(private suppReqService: SuppReqsService) {}


    @ApiOperation({ summary: 'Создание запроса в тех поддержку пользователем' })
    @ApiResponse({status: 200, type: SuppReqs})
    @Post()
    create(@Body() suppReqDto: CreateSupportRequestDto) {
        return this.suppReqService.createRequest(suppReqDto);
    }

    @ApiOperation({ summary: 'Получение всех запросов пользователя' })
    @ApiResponse({status: 200, type: Notification})
    @Get('user/:userId')
    getForUser(@Param('userId') userId: number) {
        return this.suppReqService.getUserRequests(userId);
    }
}
