import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreatePlatosDto } from './create-platos.dto';
import { IsOptional } from 'class-validator';


export class UpdatePlatosDto extends PartialType(
  OmitType(CreatePlatosDto, ['imageUrl'] as const),
) {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    required: false,
    description: 'Selecciona una nueva imagen para el plato' 
  })
  @IsOptional()
  file?: any;
}
