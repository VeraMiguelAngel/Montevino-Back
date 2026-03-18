import {
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, {
    message: 'El nombre solo puede contener letras, acentos y espacios',
  })
  name?: string;

  @IsOptional()
  @IsNumber()
  phone?: number;
}
