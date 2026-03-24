import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Min, IsUUID, IsEnum, Matches, IsNumberString } from 'class-validator';

export enum TipoProducto {
  PLATOS = "platos",
  BEBIDA = "bebidas",
}

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

  @ApiProperty({ description: 'Precio del plato', example: '15.5' })
  @IsNumberString({}, { message: 'El precio debe ser un número' })
  @IsNotEmpty()
  price: string;

  @ApiProperty({ description: "Ingredientes de plato" })
  @IsString()
  @IsNotEmpty()
  ingredientes: string;
  
  @ApiProperty({ description: 'URL de la foto', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

 
  @ApiProperty({ example: '50', description: 'Cantidad en stock' })
  @IsNumberString()
  @IsNotEmpty()
  stock: string;
  
  @ApiProperty({
    example: 'uuid-de-la-categoria',
    description: 'ID de la categoría asociada',
  })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ 
  description: 'Tipo de producto', 
  enum: TipoProducto, 
  example: TipoProducto.PLATOS 
  })
  @IsEnum(TipoProducto)
  @IsNotEmpty()
  type: TipoProducto;

  @ApiProperty({ type: 'string', format: 'binary', description: 'Archivo de imagen' })
  @IsOptional()
  file?: any;
}
