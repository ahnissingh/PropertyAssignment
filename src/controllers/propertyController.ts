import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Property from '../models/Property';
import { ApiError } from '../middleware/errorHandler';
import { clearCache } from '../middleware/cache';
import { FilterOptions } from '../types';

/**
 * Get all properties with pagination and filtering
 * @route GET /api/properties
 * @access Public
 */
export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object from query params
    const filter: FilterOptions = {};
    
    // Type filter
    if (req.query.type) filter.type = req.query.type as string;
    
    // Price range filter
    if (req.query.minPrice) filter.minPrice = parseFloat(req.query.minPrice as string);
    if (req.query.maxPrice) filter.maxPrice = parseFloat(req.query.maxPrice as string);
    
    // Location filters
    if (req.query.state) filter.state = req.query.state as string;
    if (req.query.city) filter.city = req.query.city as string;
    
    // Room filters
    if (req.query.minBedrooms) filter.minBedrooms = parseInt(req.query.minBedrooms as string);
    if (req.query.maxBedrooms) filter.maxBedrooms = parseInt(req.query.maxBedrooms as string);
    if (req.query.minBathrooms) filter.minBathrooms = parseInt(req.query.minBathrooms as string);
    if (req.query.maxBathrooms) filter.maxBathrooms = parseInt(req.query.maxBathrooms as string);
    
    // Other filters
    if (req.query.furnished) filter.furnished = req.query.furnished as string;
    if (req.query.listedBy) filter.listedBy = req.query.listedBy as string;
    if (req.query.minRating) filter.minRating = parseFloat(req.query.minRating as string);
    if (req.query.isVerified) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.listingType) filter.listingType = req.query.listingType as string;
    
    // Amenities filter (comma-separated list)
    if (req.query.amenities) {
      filter.amenities = (req.query.amenities as string).split(',');
    }
    
    // Tags filter (comma-separated list)
    if (req.query.tags) {
      filter.tags = (req.query.tags as string).split(',');
    }
    
    // Build MongoDB query based on filter options
    const query: any = {};
    
    if (filter.type) query.type = filter.type;
    if (filter.state) query.state = filter.state;
    if (filter.city) query.city = filter.city;
    if (filter.furnished) query.furnished = filter.furnished;
    if (filter.listedBy) query.listedBy = filter.listedBy;
    if (filter.isVerified !== undefined) query.isVerified = filter.isVerified;
    if (filter.listingType) query.listingType = filter.listingType;
    
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }
    
    if (filter.minBedrooms !== undefined || filter.maxBedrooms !== undefined) {
      query.bedrooms = {};
      if (filter.minBedrooms !== undefined) query.bedrooms.$gte = filter.minBedrooms;
      if (filter.maxBedrooms !== undefined) query.bedrooms.$lte = filter.maxBedrooms;
    }
    
    if (filter.minBathrooms !== undefined || filter.maxBathrooms !== undefined) {
      query.bathrooms = {};
      if (filter.minBathrooms !== undefined) query.bathrooms.$gte = filter.minBathrooms;
      if (filter.maxBathrooms !== undefined) query.bathrooms.$lte = filter.maxBathrooms;
    }
    
    if (filter.minRating !== undefined) query.rating = { $gte: filter.minRating };
    
    // For pipe-separated fields, use regex to match any of the values
    if (filter.amenities && filter.amenities.length > 0) {
      const amenityRegexes = filter.amenities.map(a => new RegExp(`(^|\\|)${a}(\\||$)`, 'i'));
      query.amenities = { $all: amenityRegexes };
    }
    
    if (filter.tags && filter.tags.length > 0) {
      const tagRegexes = filter.tags.map(t => new RegExp(`(^|\\|)${t}(\\||$)`, 'i'));
      query.tags = { $all: tagRegexes };
    }
    
    // Execute query with pagination
    const properties = await Property.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count for pagination
    const total = await Property.countDocuments(query);
    
    res.json({
      properties,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get property by ID
 * @route GET /api/properties/:id
 * @access Public
 */
export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      throw ApiError.notFound('Property not found');
    }
    
    res.json(property);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new property
 * @route POST /api/properties
 * @access Private
 */
export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      throw ApiError.unauthorized();
    }

    // Generate property ID (e.g., PROP1001)
    const latestProperty = await Property.findOne().sort({ id: -1 });
    let newId = 'PROP1000';
    
    if (latestProperty && latestProperty.id) {
      const idNumber = parseInt(latestProperty.id.replace('PROP', ''));
      newId = `PROP${idNumber + 1}`;
    }
    
    const property = new Property({
      ...req.body,
      id: newId,
      createdBy: req.user.userId
    });
    
    const savedProperty = await property.save();
    
    // Clear cache for properties list
    await clearCache('api:/api/properties*');
    
    res.status(201).json(savedProperty);
  } catch (error) {
    next(error);
  }
};

/**
 * Update property
 * @route PUT /api/properties/:id
 * @access Private
 */
export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const property = await Property.findById(req.params.id);
    
    if (!property) {
      throw ApiError.notFound('Property not found');
    }
    
    // Check if user is the owner of the property
    if (property.createdBy.toString() !== req.user.userId) {
      throw ApiError.forbidden('Not authorized to update this property');
    }
    
    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    // Clear related cache
    await clearCache(`api:/api/properties/${req.params.id}`);
    await clearCache('api:/api/properties*');
    
    res.json(updatedProperty);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete property
 * @route DELETE /api/properties/:id
 * @access Private
 */
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const property = await Property.findById(req.params.id);
    
    if (!property) {
      throw ApiError.notFound('Property not found');
    }
    
    // Check if user is the owner of the property
    if (property.createdBy.toString() !== req.user.userId) {
      throw ApiError.forbidden('Not authorized to delete this property');
    }
    
    await property.deleteOne();
    
    // Clear related cache
    await clearCache(`api:/api/properties/${req.params.id}`);
    await clearCache('api:/api/properties*');
    
    res.json({ message: 'Property removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * Search properties
 * @route GET /api/properties/search
 * @access Public
 */
export const searchProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      throw ApiError.badRequest('Search query is required');
    }
    
    const searchRegex = new RegExp(query as string, 'i');
    
    const properties = await Property.find({
      $or: [
        { title: searchRegex },
        { type: searchRegex },
        { state: searchRegex },
        { city: searchRegex },
        { amenities: searchRegex },
        { tags: searchRegex }
      ]
    }).limit(20);
    
    res.json(properties);
  } catch (error) {
    next(error);
  }
};