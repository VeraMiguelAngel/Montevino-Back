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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
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

  async findAll(isActive?: string) {
    if (isActive === 'true') {
      return await this.usersRepository.find({
        where: { isActive: true },
      });
    }

    if (isActive === 'false') {
      return await this.usersRepository.find({
        where: { isActive: false },
      });
    }

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

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.name) user.name = updateUserDto.name;
    if (updateUserDto.email) user.email = updateUserDto.email;

    return {
      message: 'User updated successfully',
    };
  }

  async desactivateUser(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    user.isActive = false;
    await this.usersRepository.save(user);

    return { message: 'User deactivated successfully' };
  }

  async activateUser(id: string) {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    user.isActive = true;

    await this.usersRepository.save(user);

    return { message: 'User activated successfully' };
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
