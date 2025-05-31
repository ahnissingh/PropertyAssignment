import { Router } from 'express';
import { body } from 'express-validator';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getUserFavorites,
  checkFavorite
} from '../controllers/favoriteController';
import { protect } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// @route   POST /api/favorites
// @desc    Add property to favorites
// @access  Private
router.post(
  '/',
  protect,
  [
    body('propertyId').notEmpty().withMessage('Property ID is required')
  ],
  addToFavorites
);

// @route   DELETE /api/favorites/:propertyId
// @desc    Remove property from favorites
// @access  Private
router.delete('/:propertyId', protect, removeFromFavorites);

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', protect, cacheMiddleware(60), getUserFavorites);

// @route   GET /api/favorites/check/:propertyId
// @desc    Check if property is in user's favorites
// @access  Private
router.get('/check/:propertyId', protect, cacheMiddleware(60), checkFavorite);

export default router;