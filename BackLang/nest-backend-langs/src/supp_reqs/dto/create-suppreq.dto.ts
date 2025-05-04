import {IsString, IsNotEmpty, IsOptional, IsNumber} from 'class-validator';

export class CreateSupportRequestDto {
    @IsNumber()
    @IsNotEmpty()
    user_id: number;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    status?: string; // Необязательное поле, будет переопределено
}