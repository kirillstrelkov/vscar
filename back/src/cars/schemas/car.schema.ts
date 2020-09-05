import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'cars' })
export class Car extends Document {
}

export const CarSchema = SchemaFactory.createForClass(Car);
