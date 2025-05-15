import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {User} from "dockerode";
import {PrSolution} from "./pr_solutions.model";
import {PrSolutionsService} from "./pr_solutions.service";

@Controller('prsolutions')
export class PrSolutionsController {
    constructor(private prSolutionsService: PrSolutionsService) {}

    @Get(':prTask_id/:student_id')
    async getUserPrSolution(@Param('prTask_id') prTask_id: number, @Param('student_id') student_id: number) {
        return this.prSolutionsService.getUserPrSolution(prTask_id, student_id);
    }

    @Post('/run-submit')
    async runSubmit(@Body() body: { code: string; language: string; testCode: string;}){
        const { code, language, testCode} = body;
        return this.prSolutionsService.runCodeWithTests(code, language, testCode);
    }

    @Post('/user-submit')
    async saveUserPrSolution(@Body() body: {prTaskId: number, studentId: number, code: string, lang_name: string}){
        const { prTaskId, studentId, code, lang_name} = body;
        return this.prSolutionsService.saveUserPrSolution(prTaskId, studentId, code, lang_name);
    }
}
