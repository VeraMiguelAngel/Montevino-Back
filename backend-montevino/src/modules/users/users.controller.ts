import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { usersRole } from './users-role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(@Query('isActive') isActive?: string) {
    return this.usersService.findAll(isActive);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @UploadedFile() file?: Express.Multer.File,) {
    return this.usersService.update(id, updateUserDto, file);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  desactivateUser(@Param('id') id: string) {
    return this.usersService.desactivateUser(id);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/activate')
  activateUser(@Param('id') id: string) {
    return this.usersService.activateUser(id);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/makeadmin')
  makeAdmin(@Param('id') id: string, @Req() req) {
    return this.usersService.makeAdmin(id, req.user);
  }
}
