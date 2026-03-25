import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import { Repository } from 'typeorm';
import { usersRole } from './users-role.enum';
import { FileUploadRepository } from 'src/file-upload/file-upload.repository';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly fileUploadRepository: FileUploadRepository,
  ) {}

  async findByAuth0Id(auth0Id: string): Promise<Users | null> {
    return this.usersRepository.findOne({ where: { auth0Id } });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(createUserDto: CreateUserDto) {
    const newUser = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(newUser);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({
      where: { id },
      relations: {
        reservations: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    if (file) {
      const upload = await this.fileUploadRepository.uploadImage(file);
      user.imgUrl = upload.secure_url;
    }

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;

    await this.usersRepository.save(user);
    return {
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        imgUrl: user.imgUrl
      }
    };
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    await this.usersRepository.delete(id);

    return { message: 'User deleted successfully' };
  }

  async makeAdmin(userId: string, currentUser: Users) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.id === currentUser.id) {
      throw new BadRequestException('No podés modificar tu propio rol');
    }

    if (user.role === usersRole.ADMIN) {
      throw new BadRequestException('El usuario ya es admin');
    }

    user.role = usersRole.ADMIN;

    await this.usersRepository.save(user);

    return {
      message: 'Usuario ahora es administrador',
    };
  }
}
