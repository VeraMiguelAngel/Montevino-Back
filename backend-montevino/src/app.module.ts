import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import typeormConfig from './config/typeorm';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PlatosModule } from './modules/platos/platos.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => ({
        ...typeormConfig(), // usa la config que definimos en typeorm.ts
      }),
    }),
    UsersModule,
    ReservationsModule,
    PlatosModule,
    CategoriesModule,
    PedidosModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {
    // si más adelante necesitás middlewares, los agregás acá
  }
}
