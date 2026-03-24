import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import data from 'data.json';
import { Repository } from 'typeorm';
import { Platos } from './entities/platos.entity';
import { Category } from '../categories/entities/category.entity';
import { CreatePlatosDto, TipoProducto } from './dto/create-platos.dto';
import { UpdatePlatosDto } from './dto/update-platos.dto';
import { FileUploadRepository } from 'src/file-upload/file-upload.repository';

@Injectable()
export class PlatosService { 
  constructor(
    @InjectRepository(Platos)
    private readonly platosRepository: Repository<Platos>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    private readonly fileUploadRepository: FileUploadRepository,
  ) {}

  async seeder() {
    const categories = await this.categoriesRepository.find();
    const platosExistentes = await this.platosRepository.find();

    for (const item of data as any[]) {
      const yaExiste = platosExistentes.find(p => p.name === item.name);
      if (yaExiste) continue;

      const category = categories.find((cat) => cat.name === item.category);
      if (!category) continue;

      let finalImageUrl = item.imageUrl;
      try {
        const upload = await this.fileUploadRepository.uploadImageFromUrl(item.imageUrl, item.name);
        finalImageUrl = upload.secure_url;
        console.log(`Imagen subida para: ${item.name}`);
      } catch (error) {
        console.error(`Error subiendo imagen de ${item.name}, usando original.`);
      }

      const nuevoPlato = this.platosRepository.create({
        name: item.name,
        price: item.price,
        ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes.join(', ') : item.ingredientes,
        description: item.description,
        imageUrl: finalImageUrl,
        stock: item.stock,
        category: category,
        type: item.type,
      });

      await this.platosRepository.save(nuevoPlato);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return 'Platos Added with Cloudinary Images';
  }

  async create(createPlatoDto: CreatePlatosDto, file: Express.Multer.File ) {
    const category = await this.categoriesRepository.findOneBy({ 
      id: createPlatoDto.categoryId 
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    let finalImageUrl = createPlatoDto.imageUrl;

    if (file) {
      try {
        console.log(`Subiendo archivo real a Cloudinary para: ${createPlatoDto.name}`);
        const upload = await this.fileUploadRepository.uploadImage(file);
        finalImageUrl = upload.secure_url;
      } catch (error) {
        throw new BadRequestException(`Error al subir la imagen: ${error.message}`);
      }
    } else {
      throw new BadRequestException('Es obligatorio subir una imagen para el plato');
    }

    const newPlato = this.platosRepository.create({
      ...createPlatoDto,
      price: Number(createPlatoDto.price),
      stock: Number(createPlatoDto.stock),
      imageUrl: finalImageUrl,
      category: category 
    });
    
    return await this.platosRepository.save(newPlato);
  }

  async getPlatos(page: number, limit: number, type?: TipoProducto, category?: string) {
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = { name: category };

    return await this.platosRepository.find({
      relations: { category: true },
      where: where,
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: string) {
    return this.platosRepository.findOneBy({ id });
  }

  async update(id: string, updatePlatosDto: UpdatePlatosDto) {
  const dataToUpdate: any = { ...updatePlatosDto };

  if (updatePlatosDto.price) {
    dataToUpdate.price = Number(updatePlatosDto.price);
  }
  if (updatePlatosDto.stock) {
    dataToUpdate.stock = Number(updatePlatosDto.stock);
  }

  const plato = await this.platosRepository.preload({
    id: id,
    ...dataToUpdate, 
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
