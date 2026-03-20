import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bebidas } from "./entities/bebidas.entity";
import { Category } from "../categories/entities/category.entity";
import { BebidasService } from "./bebidas.service";
import { BebidasController } from "./bebidas.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Bebidas, Category])],
  controllers: [BebidasController],
  providers: [BebidasService],
})
export class BebidasModule {}