import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentificationController } from './identification/identification.controller';
import { IdentificationService } from './identification/identification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './identification/identification.entity';

import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '..', '.env') });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DB_URL,
      autoLoadEntities: true,
      synchronize: true
    }),
    TypeOrmModule.forFeature([Contact])
  ],
  controllers: [AppController, IdentificationController],
  providers: [AppService, IdentificationService],
})
export class AppModule {

  constructor(){
  }

 }
