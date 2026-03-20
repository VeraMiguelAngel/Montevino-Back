import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from "@nestjs/common";
import { BebidasService } from "./bebidas.service";

@Controller("bebidas")
export class BebidasController {
  constructor(private readonly bebidasService: BebidasService) {}

  @Get()
  findAll(
    @Query("page") page = 1,
    @Query("limit") limit = 100
  ) {
    return this.bebidasService.getBebidas(Number(page), Number(limit));
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.bebidasService.findOne(id);
  }

   @Post('seeder')
    seedBebidas() {
      return this.bebidasService.seeder();
    }
}