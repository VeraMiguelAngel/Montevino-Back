import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Bebidas } from "./entities/bebidas.entity";
import { Category } from "../categories/entities/category.entity";
import data from "data.json";

@Injectable()
export class BebidasService {
  constructor(
    @InjectRepository(Bebidas)
    private readonly bebidasRepository: Repository<Bebidas>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async getBebidas(page: number, limit: number) {
    return await this.bebidasRepository.find({
      relations: { category: true },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.bebidasRepository.findOneBy({ id });
  }
  async seeder() {
    const categories = await this.categoriesRepository.find();

    const bebidasToSeed = (data as any[])
        .filter((item) => item.type === "bebidas")
        .map((item) => {
        const category = categories.find((cat) => cat.name === item.category);

        if (!category) {
          console.warn(
            `CategorÃa "${item.category}" no encontrada para la bebida "${item.name}"`,
          );
          return null;
        }

        return {
          name: item.name,
          price: item.price,
          ingredientes: Array.isArray(item.ingredientes)
            ? item.ingredientes.join(', ')
            : item.ingredientes,
          description: item.description,
          imageUrl: item.imageUrl,
          stock: item.stock,
          category: category,
        };
      })
      .filter((bebida) => bebida !== null);

    await this.bebidasRepository.upsert(bebidasToSeed, ['name']);

    return 'Bebidas Added';
    }
}