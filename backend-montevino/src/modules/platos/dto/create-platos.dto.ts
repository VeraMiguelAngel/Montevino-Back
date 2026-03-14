import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Min, IsUUID, IsEnum } from 'class-validator';

export enum TipoProducto {
  PLATOS = "platos",
  BEBIDA = "bebidas",
}

export class CreatePlatosDto {
  @ApiProperty({ description: 'Nombre del plato', example: 'Tallarines al Pesto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Precio del plato', example: 15.50 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: "Ingredientes de plato"})
  @IsString()
  @IsNotEmpty()
  ingredientes: string;
  
  @ApiProperty({ description: 'URL de la foto del plato', required: false })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ description: 'Descripción detallada de los ingredientes' })
  @IsString()
  @IsNotEmpty()
  description: string;
  
  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @IsNumber()
  @IsNotEmpty()
  stock: number;
  
  @ApiProperty({ example: 'uuid-de-la-categoria', description: 'ID de la categoría asociada' })
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
}
