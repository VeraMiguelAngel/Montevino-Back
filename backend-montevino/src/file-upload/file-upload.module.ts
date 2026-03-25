import { Module } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { CloudinaryConfig } from 'src/config/cloudinary';
import { FileUploadRepository } from './file-upload.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Platos } from 'src/modules/platos/entities/platos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Platos])],
  controllers: [FileUploadController],
  providers: [FileUploadService, CloudinaryConfig, FileUploadRepository],
  exports: [FileUploadRepository],
})
export class FileUploadModule {}