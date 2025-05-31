import mongoose, { Schema } from 'mongoose';
import { IFavorite } from '../types';

const FavoriteSchema = new Schema<IFavorite>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure uniqueness of user-property combination
FavoriteSchema.index({ user: 1, property: 1 }, { unique: true });

const Favorite = mongoose.model<IFavorite>('Favorite', FavoriteSchema);

export default Favorite;