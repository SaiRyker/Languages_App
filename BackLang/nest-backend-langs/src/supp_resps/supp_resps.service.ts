import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {SuppReqs} from "../supp_reqs/supp_reqs.model";
import {CreateSupportRequestDto} from "../supp_reqs/dto/create-suppreq.dto";
import {User} from "../users/user.model";
import {SuppResps} from "./supp_resps.model";
import {CreateResponDto} from "./dto/create-respon.dto";

@Injectable()
export class SuppRespsService {
    constructor(@InjectModel(SuppResps) private suppRespRepository: typeof SuppResps) {}

    async createRequest(respDto: CreateResponDto): Promise<any> {
        const resp = await this.suppRespRepository.create(respDto);
        return resp;
    }

    async getUserRequests(req_id: number): Promise<any> {
        const resps = this.suppRespRepository.findAll({
            where: {req_id: req_id},
            include: [{
                model: User,
                attributes: {exclude: ['user_login', 'user_password', 'user_email']}
            }],
            order: [['id_resp', 'DESC']]
        });
        return resps;
    }
}
