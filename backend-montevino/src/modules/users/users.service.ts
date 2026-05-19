import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { usersRole } from './users-role.enum';
import { FileUploadRepository } from 'src/file-upload/file-upload.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly fileUploadRepository: FileUploadRepository,
  ) {}

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.usersRepository.findOneBy({ email });

    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const user = this.usersRepository.create({
      email,
      name: dto.name,
      auth0Id: dto.auth0Id,
      imgUrl: dto.imgUrl,
      role: usersRole.USER,
      isActive: true,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(isActive?: string) {
    if (isActive === undefined) {
      return await this.usersRepository.find();
    }

    if (isActive !== 'true' && isActive !== 'false') {
      throw new BadRequestException('isActive debe ser true o false');
    }

    return await this.usersRepository.find({
      where: { isActive: isActive === 'true' },
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOneBy({
      email: email.toLowerCase().trim(),
    });
  }

  async findByAuth0Id(auth0Id: string) {
    return await this.usersRepository.findOneBy({ auth0Id });
  }

  async update(id: string, dto: UpdateUserDto, file?: Express.Multer.File) {
    const user = await this.findOne(id);

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const exists = await this.findByEmail(dto.email);
      if (exists && exists.id !== user.id) {
        throw new ConflictException('El correo ya está registrado');
      }
      user.email = dto.email.toLowerCase().trim();
    }

    if (dto.name) {
      user.name = dto.name;
    }

    if (file) {
      const upload = await this.fileUploadRepository.uploadImage(file);
      user.imgUrl = upload.secure_url;
    }

    return await this.usersRepository.save(user);
  }

  async desactivateUser(id: string) {
    const user = await this.findOne(id);
    user.isActive = false;
    return await this.usersRepository.save(user);
  }

  async activateUser(id: string) {
    const user = await this.findOne(id);
    user.isActive = true;
    return await this.usersRepository.save(user);
  }

  async makeAdmin(id: string, requester: Users) {
    if (requester?.id === id) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    const user = await this.findOne(id);
    user.role = usersRole.ADMIN;
    return await this.usersRepository.save(user);
  }

  async makeHost(id: string, requester: Users) {
    if (requester?.id === id) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }

    const user = await this.findOne(id);
    user.role = usersRole.HOST;
    return await this.usersRepository.save(user);
  }

  async makeWaiter(id: string, requester: Users) {
    if (requester?.id === id) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }
    const user = await this.findOne(id);
    user.role = usersRole.MOZO;
    return await this.usersRepository.save(user);
  }
}
