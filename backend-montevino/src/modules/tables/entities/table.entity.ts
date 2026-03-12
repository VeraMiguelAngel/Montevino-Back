import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TableStatus } from '../table.enum';
import { Reservations } from 'src/modules/reservations/entities/reservation.entity';

@Entity({
  name: 'TABLES',
})
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  tableNumber: number;

  @Column({
    type: 'enum',
    enum: TableStatus,
    default: TableStatus.DISPONIBLE,
  })
  status: TableStatus;

  @OneToMany(() => Reservations, (reservation) => reservation.table)
  reservations: Reservations[];
}
