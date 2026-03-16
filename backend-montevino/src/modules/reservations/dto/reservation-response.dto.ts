export class ReservationResponseDto {
  id: string;

  reservationDate: string;

  startTime: string;

  peopleCount: number;

  totalPrice: number;

  depositAmount: number;

  status: string;

  notes?: string;

  user: {
    name: string;
    email: string;
  };

  table: {
    tableNumber: number;
  };

  pedidos: {
    quantity: number;
    price: number;
    name: string;
  }[];
}
