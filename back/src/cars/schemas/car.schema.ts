import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoosePaginate from 'mongoose-paginate';

@Schema({ collection: 'cars' })
export class Car extends Document {
}

export const CarSchema = SchemaFactory.createForClass(Car);
CarSchema.plugin(mongoosePaginate);

// Expected indecies: adac_id, name, price
