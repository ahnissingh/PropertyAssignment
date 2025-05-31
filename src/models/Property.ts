import mongoose, { Schema } from 'mongoose';
import { IProperty } from '../types';

const PropertySchema = new Schema<IProperty>({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  areaSqFt: {
    type: Number,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  amenities: {
    type: String,
    default: ""
  },
  furnished: {
    type: String,
    enum: ['Furnished', 'Unfurnished', 'Semi'],
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  listedBy: {
    type: String,
    enum: ['Builder', 'Owner', 'Agent'],
    required: true
  },
  tags: {
    type: String,
    default: ""
  },
  colorTheme: {
    type: String,
    default: "#6ab45e"
  },
  rating: {
    type: Number,
    min: 1.0,
    max: 5.0,
    default: 3.0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  listingType: {
    type: String,
    enum: ['rent', 'sale'],
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for common search fields
PropertySchema.index({ price: 1 });
PropertySchema.index({ state: 1, city: 1 });
PropertySchema.index({ type: 1 });
PropertySchema.index({ bedrooms: 1 });
PropertySchema.index({ bathrooms: 1 });
PropertySchema.index({ listingType: 1 });
PropertySchema.index({ createdBy: 1 });

const Property = mongoose.model<IProperty>('Property', PropertySchema);

export default Property;