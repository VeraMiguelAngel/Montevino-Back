import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { Repository } from 'typeorm';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from './table.enum';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private tablesRepository: Repository<Table>,
  ) {}

  create(createTableDto: CreateTableDto) {
    const table = this.tablesRepository.create(createTableDto);
    return this.tablesRepository.save(table);
  }

  async findAvailableTable() {
    return this.tablesRepository.findOne({
      where: {
        status: TableStatus.DISPONIBLE,
      },
    });
  }

  findAll() {
    return this.tablesRepository.find();
  }
}
