import mongoose, { Schema } from 'mongoose';
import { IRecommendation } from '../types';

const RecommendationSchema = new Schema<IRecommendation>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  property: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  message: {
    type: String,
    default: ""
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);

export default Recommendation;