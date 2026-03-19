import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, IsUrl, Min, IsUUID, IsEnum, Matches } from 'class-validator';

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

  @ApiProperty({ description: 'Precio del plato', example: 15.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: "Ingredientes de plato"})
  @IsUrl({}, { message: 'La imageUrl debe ser una URL válida' })
  @IsNotEmpty()
  ingredientes: string;
  
  @ApiProperty({ description: 'URL de la foto del plato', required: false })
  @IsString()
  @IsUrl({}, { message: 'La imageUrl debe ser una URL válida' })
  @Matches(/\.(jpg|jpeg|png|webp)$/i, {
    message: 'La imagen debe ser un formato válido (jpg, jpeg, png, webp)',
  })
  @IsOptional()
  imageUrl?: string;

 
  @ApiProperty({ example: 50, description: 'Cantidad en stock' })
  @IsNumber()
  @IsNotEmpty()
  stock: number;
  
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
}
