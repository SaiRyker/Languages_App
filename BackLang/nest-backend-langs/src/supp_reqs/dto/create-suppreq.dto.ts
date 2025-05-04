import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSupportRequestDto {
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