import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatosController } from './platos.controller';
import { PlatosService } from './platos.service';
import { Platos } from './entities/platos.entity';
import { Category } from '../categories/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Platos, Category])],
  controllers: [PlatosController],
  providers: [PlatosService],
})
export class PlatosModule {}
