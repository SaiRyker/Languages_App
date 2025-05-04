import { Injectable } from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {User} from "../users/user.model";
import {SuppReqs} from "./supp_reqs.model";
import {CreateSupportRequestDto} from "./dto/create-suppreq.dto";

@Injectable()
export class SuppReqsService {
    constructor(@InjectModel(SuppReqs) private suppReqRepository: typeof SuppReqs) {}

    async createRequest(reqDto: CreateSupportRequestDto): Promise<any> {
        const req = await this.suppReqRepository.create(reqDto);
        return req;
    }

    async getUserRequests(userId: number): Promise<any> {
        const reqs = this.suppReqRepository.findAll({
            where: {user_id: userId},
            include: [{
                model: User,
                attributes: {exclude: ['user_login', 'user_password', 'user_email']}
            }],
            order: [['id_req', 'DESC']]
        });
        return reqs;
    }

}
