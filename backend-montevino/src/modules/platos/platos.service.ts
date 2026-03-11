import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import data from 'data.json';
import { Repository } from 'typeorm';
import { Platos } from './entities/platos.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePlatosDto } from './dto/create-platos.dto';
import { UpdatePlatosDto } from './dto/update-platos.dto';

@Injectable()
export class PlatosService {
  constructor(
    @InjectRepository(Platos)
    private readonly platosRepository: Repository<Platos>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async seeder() {
    const categories = await this.categoriesRepository.find();

    const platosToSeed = (data as any[])
      .map((item) => {
        const category = categories.find((cat) => cat.name === item.category);

        if (!category) {
          console.warn(
            `Categoría "${item.category}" no encontrada para el plato "${item.name}"`,
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
      .filter((plato) => plato !== null);

    await this.platosRepository.upsert(platosToSeed, ['name']);

    return 'Platos Added';
  }

  async create(createPlatoDto: CreatePlatosDto) {
    const category = await this.categoriesRepository.findOneBy({
      id: createPlatoDto.categoryId,
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const newPlato = this.platosRepository.create({
      ...createPlatoDto,
      category: category,
    });

    return await this.platosRepository.save(newPlato);
  }

  async getPlatos(page: number, limit: number) {
    return await this.platosRepository.find({
      relations: { category: true },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: string) {
    return this.platosRepository.findOneBy({ id });
  }

  async update(id: string, updatePlatosDto: UpdatePlatosDto) {
    const plato = await this.platosRepository.preload({
      id: id,
      ...updatePlatosDto,
    });

    if (!plato) {
      throw new NotFoundException(`El plato con ID ${id} no fue encontrado`);
    }

    if (updatePlatosDto.categoryId) {
      const category = await this.categoriesRepository.findOneBy({
        id: updatePlatosDto.categoryId,
      });

      if (!category) {
        throw new NotFoundException('La nueva categoría no existe');
      }
      plato.category = category;
    }

    return await this.platosRepository.save(plato);
  }

  async remove(id: string) {
    const plato = await this.findOne(id);

    if (!plato) {
      throw new NotFoundException(`El plato con ID ${id} no existe`);
    }

    await this.platosRepository.remove(plato);
    return { message: `Plato '${plato.name}' eliminado correctamente` };
  }
}
