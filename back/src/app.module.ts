import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { CarsModule } from './cars/cars.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/test'), CarsModule],
  controllers: [AppController],
})
export class AppModule { }
