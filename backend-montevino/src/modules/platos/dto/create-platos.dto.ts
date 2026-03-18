import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  IsUUID,
} from 'class-validator';

export class CreatePlatosDto {
  @ApiProperty({
    description: 'Nombre del plato',
    example: 'Tallarines al Pesto',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción detallada de los ingredientes' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Ingredientes del plato' })
  @IsString()
  @IsNotEmpty()
  ingredients: string;

  @ApiProperty({ description: 'Precio del plato', example: 15.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'URL de la foto del plato', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'ID de la categoría asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
