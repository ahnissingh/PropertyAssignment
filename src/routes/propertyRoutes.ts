import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getProperties, 
  getPropertyById, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  searchProperties
} from '../controllers/propertyController';
import { protect } from '../middleware/auth';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
// @access  Public
router.get('/', cacheMiddleware(60), getProperties);

// @route   GET /api/properties/search
// @desc    Search properties
// @access  Public
router.get('/search', cacheMiddleware(60), searchProperties);

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', cacheMiddleware(300), getPropertyById);

// @route   POST /api/properties
// @desc    Create a new property
// @access  Private
router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('type').notEmpty().withMessage('Property type is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('state').notEmpty().withMessage('State is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('areaSqFt').isNumeric().withMessage('Area must be a number'),
    body('bedrooms').isInt().withMessage('Bedrooms must be an integer'),
    body('bathrooms').isNumeric().withMessage('Bathrooms must be a number'),
    body('furnished').isIn(['Furnished', 'Unfurnished', 'Semi']).withMessage('Invalid furnished status'),
    body('availableFrom').isISO8601().withMessage('Available date must be valid date'),
    body('listedBy').isIn(['Builder', 'Owner', 'Agent']).withMessage('Invalid listed by value'),
    body('rating').isFloat({ min: 1, max: 5 }).optional().withMessage('Rating must be between 1 and 5'),
    body('listingType').isIn(['rent', 'sale']).withMessage('Invalid listing type')
  ],
  createProperty
);

// @route   PUT /api/properties/:id
// @desc    Update a property
// @access  Private
router.put(
  '/:id',
  protect,
  [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('areaSqFt').optional().isNumeric().withMessage('Area must be a number'),
    body('bedrooms').optional().isInt().withMessage('Bedrooms must be an integer'),
    body('bathrooms').optional().isNumeric().withMessage('Bathrooms must be a number'),
    body('furnished').optional().isIn(['Furnished', 'Unfurnished', 'Semi']).withMessage('Invalid furnished status'),
    body('availableFrom').optional().isISO8601().withMessage('Available date must be valid date'),
    body('listedBy').optional().isIn(['Builder', 'Owner', 'Agent']).withMessage('Invalid listed by value'),
    body('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('listingType').optional().isIn(['rent', 'sale']).withMessage('Invalid listing type')
  ],
  updateProperty
);

// @route   DELETE /api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', protect, deleteProperty);

export default router;