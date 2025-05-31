import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Favorite from '../models/Favorite';
import Property from '../models/Property';
import { ApiError } from '../middleware/errorHandler';
import { clearCache } from '../middleware/cache';

/**
 * Add property to favorites
 * @route POST /api/favorites
 * @access Private
 */
export const addToFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { propertyId } = req.body;

    if (!propertyId) {
      throw ApiError.badRequest('Property ID is required');
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      user: req.user.userId,
      property: propertyId
    });

    if (existingFavorite) {
      return res.status(400).json({
        message: 'Property is already in favorites'
      });
    }

    const favorite = new Favorite({
      user: req.user.userId,
      property: propertyId
    });

    await favorite.save();

    // Clear cache
    await clearCache(`api:/api/favorites/user/${req.user.userId}`);

    res.status(201).json({
      _id: favorite._id,
      user: favorite.user,
      property: favorite.property,
      createdAt: favorite.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove property from favorites
 * @route DELETE /api/favorites/:propertyId
 * @access Private
 */
export const removeFromFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { propertyId } = req.params;

    const favorite = await Favorite.findOneAndDelete({
      user: req.user.userId,
      property: propertyId
    });

    if (!favorite) {
      throw ApiError.notFound('Favorite not found');
    }

    // Clear cache
    await clearCache(`api:/api/favorites/user/${req.user.userId}`);

    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's favorites
 * @route GET /api/favorites
 * @access Private
 */
export const getUserFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ user: req.user.userId })
      .populate('property')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Favorite.countDocuments({ user: req.user.userId });

    res.json({
      favorites,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if property is in user's favorites
 * @route GET /api/favorites/check/:propertyId
 * @access Private
 */
export const checkFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { propertyId } = req.params;

    const favorite = await Favorite.findOne({
      user: req.user.userId,
      property: propertyId
    });

    res.json({
      isFavorite: !!favorite
    });
  } catch (error) {
    next(error);
  }
};