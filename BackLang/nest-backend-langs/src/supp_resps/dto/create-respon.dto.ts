import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateResponDto {
    @IsNumber()
    @IsNotEmpty()
    readonly req_id: number;

    @IsNumber()
    @IsNotEmpty()
    readonly responder_id: number;

    @IsString()
    @IsNotEmpty()
    readonly content: string;
}