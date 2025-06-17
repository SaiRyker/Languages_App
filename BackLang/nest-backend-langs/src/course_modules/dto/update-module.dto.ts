import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDto {
    @ApiProperty()
    module_name: string;
}