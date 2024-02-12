import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentificationController } from './identification/identification.controller';
import { IdentificationService } from './identification/identification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './identification/identification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'test.db',
      entities: [Contact],
      synchronize: true
    }),
    TypeOrmModule.forFeature([Contact])
  ],
  controllers: [AppController, IdentificationController],
  providers: [AppService, IdentificationService],
})
export class AppModule {}
