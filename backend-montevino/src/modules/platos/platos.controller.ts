import {
  Controller,
  Body,
  Get,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PlatosService } from './platos.service';
import { UpdatePlatosDto } from './dto/update-platos.dto';
import { CreatePlatosDto, TipoProducto } from './dto/create-platos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { Roles } from 'src/decorators/roles.decorator';
import { usersRole } from '../users/users-role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('platos')
export class PlatosController {
  constructor(private readonly platosService: PlatosService) {}

  @Get()
  @ApiQuery({ name: 'type', enum: TipoProducto, required: false })
  @ApiQuery({ name: 'category', type: String, required: false })
  getPlatos(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Query('type') type?: TipoProducto,
    @Query('category') category?: string,
  ) {
    return this.platosService.getPlatos(page, limit, type, category);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('seeder')
  seedPlatos() {
    return this.platosService.seeder();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.platosService.findOne(id);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlatosDto: UpdatePlatosDto,
  ) {
    return this.platosService.update(id, updatePlatosDto);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(@Body() createPlatoDto: CreatePlatosDto) {
    return this.platosService.create(createPlatoDto);
  }

  @ApiBearerAuth()
  @Roles(usersRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.platosService.remove(id);
  }
}
