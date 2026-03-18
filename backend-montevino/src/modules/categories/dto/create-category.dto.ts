import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Vinos' }) 
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}