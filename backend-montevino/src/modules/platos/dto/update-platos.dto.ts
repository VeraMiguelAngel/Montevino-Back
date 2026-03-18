import { PartialType } from '@nestjs/swagger';
import { CreatePlatosDto } from './create-platos.dto';

export class UpdatePlatosDto extends PartialType(CreatePlatosDto) {}
