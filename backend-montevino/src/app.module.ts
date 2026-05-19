import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import typeorm from './config/typeorm';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { PlatosModule } from './modules/platos/platos.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AuthModule } from './modules/auth/auth.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { AppController } from './app.controller';
import { TablesModule } from './modules/tables/tables.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BebidasModule } from './modules/bebidas/bebidas.module';
import { HostModule } from './modules/host/host.module';
import { MozoModule } from './modules/mozo/mozo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('typeorm')!,
    }),
    UsersModule,
    ReservationsModule,
    PlatosModule,
    BebidasModule,
    CategoriesModule,
    AuthModule,
    FileUploadModule,
    TablesModule,
    PaymentsModule,
    HostModule,
    MozoModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configure(consumer: MiddlewareConsumer) {
    // si más adelante necesitás middlewares, los agregás acá
  }
}
