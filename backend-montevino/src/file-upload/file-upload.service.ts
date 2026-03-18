import { Injectable, NotFoundException } from '@nestjs/common';
import { FileUploadRepository } from './file-upload.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Platos } from 'src/modules/platos/entities/platos.entity';

@Injectable()
export class FileUploadService {
    constructor(private readonly filesUploadRepository: FileUploadRepository, 
        @InjectRepository(Platos) private readonly platosRepository: Repository<Platos>,) {}

    async uploadImage(file: Express.Multer.File, platosId: string) {
        const platos = await this.platosRepository.findOneBy({ id: platosId });

        if (!platos) {
            throw new NotFoundException("Platos not found");
        }

        const uploadResponse = await this.filesUploadRepository.uploadImage(file);

        await this.platosRepository.update(platos.id, {
            imageUrl: uploadResponse.secure_url,
        });

    return await this.platosRepository.findOneBy({ id: platosId });
  }
}