import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

@Schema({ collection: 'cars' })
export class Car extends Document {
}

export const CarSchema = SchemaFactory.createForClass(Car);
CarSchema.plugin(mongoosePaginate);

CarSchema.index({ 'adac_id': 1 }); // TODO: Add unique: true
CarSchema.index({ 'name': 1 });
CarSchema.index({ 'price': 1 });
CarSchema.index({ 'attributes.name': 1 });
CarSchema.index({ 'attributes.value': 1 });
