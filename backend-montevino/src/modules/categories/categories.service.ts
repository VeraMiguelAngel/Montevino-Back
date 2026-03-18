import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import data from 'data.json';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly categoriesRepository: Repository<Category>) {}

  async seeder() { 
    const categoryNames: Set<string> = new Set((data as any).map((product: any) => product.category));

    const categoriesArray = Array.from(categoryNames);

    const categories = categoriesArray.map((string) => ({
      name: string,
    }));

    await this.categoriesRepository.upsert(categories, ['name']);

    return 'Categories Added';
  }

  async findOne(id: string) {
  const category = await this.categoriesRepository.findOne({
    where: { id },
    relations: { platos: true },
  });

  if (!category) {
    throw new NotFoundException(`La categoría con ID ${id} no fue encontrada`);
  }

  return category;
}

findAll() {
    return this.categoriesRepository.find({ relations: ['platos'] });
  }

  async create(categorieData: CreateCategoryDto) {
  const existingCategory = await this.categoriesRepository.findOneBy({ 
    name: categorieData.name 
  });

  if (existingCategory) {
    throw new ConflictException(`La categoría '${categorieData.name}' ya existe`);
  }

  const newCategorie = this.categoriesRepository.create(categorieData);
  return await this.categoriesRepository.save(newCategorie);
}


}
