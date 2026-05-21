import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Table } from './entities/table.entity';
import { Repository } from 'typeorm';
import { CreateTableDto } from './dto/create-table.dto';
import { TableStatus } from './table.enum';
import { reservationStatus } from '../reservations/reservation-status.enum';

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
      const isReserved = table.reservations.some((reservation) => {
        const reservationDate = new Date(reservation.reservationDate)
          .toISOString()
          .split('T')[0];

        return (
          reservationDate === date &&
          reservation.startTime === time &&
          reservation.status === reservationStatus.CONFIRMADA
        );
      });

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

    for (let i = 1; i <= 20; i++) {
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
      const reserved = table.reservations.some((reservation) => {
        const reservationDate = new Date(reservation.reservationDate)
          .toISOString()
          .split('T')[0];

        return (
          reservationDate === date &&
          reservation.startTime === time &&
          reservation.status === reservationStatus.CONFIRMADA
        );
      });

      return {
        tableNumber: table.tableNumber,
        status: reserved ? TableStatus.RESERVADA : TableStatus.DISPONIBLE,
      };
    });
  }

  findAll() {
    return this.tablesRepository.find();
  }

  async getTablesStatus() {
    const tables = await this.tablesRepository.find({
      relations: ['reservations'],
    });

    const today = new Date().toISOString().split('T')[0];

    return tables.map((table) => {
      // OCUPADA: tiene una reserva EN_CURSO sin importar la fecha
      const tieneOrdenEnCurso = table.reservations.some(
        (r) => r.status === reservationStatus.EN_CURSO,
      );

      // RESERVADA: tiene una reserva CONFIRMADA para hoy
      const tieneReservaHoy = table.reservations.some(
        (r) =>
          r.status === reservationStatus.CONFIRMADA &&
          new Date(r.reservationDate).toISOString().split('T')[0] === today,
      );

      let status = TableStatus.DISPONIBLE;
      if (tieneOrdenEnCurso) status = TableStatus.OCUPADA;
      else if (tieneReservaHoy) status = TableStatus.RESERVADA;

      return {
        id: table.id,
        tableNumber: table.tableNumber,
        status,
      };
    });
  }
}
