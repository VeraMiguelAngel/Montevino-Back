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
  ) {
    this.seedTables();
  }

  create(createTableDto: CreateTableDto) {
    const table = this.tablesRepository.create(createTableDto);
    return this.tablesRepository.save(table);
  }

  async findAvailableTable(date: string, time: string) {
    const tables = await this.tablesRepository.find({
      relations: ['reservations'],
    });

    for (const table of tables) {
      const isReserved = table.reservations.some(
        (reservation) =>
          reservation.reservationDate === date &&
          reservation.startTime === time,
      );

      if (!isReserved) {
        return table;
      }
    }

    return null;
  }

  async seedTables() {
    const count = await this.tablesRepository.count();

    if (count > 0) return;

    const tables: Partial<Table>[] = [];

    for (let i = 1; i <= 50; i++) {
      tables.push(
        this.tablesRepository.create({
          tableNumber: i,
          status: TableStatus.DISPONIBLE,
        }),
      );
    }

    await this.tablesRepository.save(tables);
  }

  async getTablesAvailability(date: string, time: string) {
    const tables = await this.tablesRepository.find({
      relations: ['reservations'],
    });

    return tables.map((table) => {
      const reserved = table.reservations.some(
        (reservation) =>
          reservation.reservationDate === date &&
          reservation.startTime === time,
      );

      return {
        tableNumber: table.tableNumber,
        status: reserved ? TableStatus.RESERVADA : TableStatus.DISPONIBLE,
      };
    });
  }

  findAll() {
    return this.tablesRepository.find();
  }
}
