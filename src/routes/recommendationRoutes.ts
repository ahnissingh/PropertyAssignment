import { Router } from 'express';
import { body } from 'express-validator';
import { 
  createRecommendation, 
  getReceivedRecommendations, 
  getSentRecommendations,
  markRecommendationAsRead,
  deleteRecommendation
} from '../controllers/recommendationController';
import { protect } from '../middleware/auth';

const router = Router();

// @route   POST /api/recommendations
// @desc    Create a new recommendation
// @access  Private
router.post(
  '/',
  protect,
  [
    body('recipientEmail').isEmail().withMessage('Valid recipient email is required'),
    body('propertyId').notEmpty().withMessage('Property ID is required'),
    body('message').optional().isString().withMessage('Message must be a string')
  ],
  createRecommendation
);

// @route   GET /api/recommendations/received
// @desc    Get recommendations received by the user
// @access  Private
router.get('/received', protect, getReceivedRecommendations);

// @route   GET /api/recommendations/sent
// @desc    Get recommendations sent by the user
// @access  Private
router.get('/sent', protect, getSentRecommendations);

// @route   PUT /api/recommendations/:id/read
// @desc    Mark a recommendation as read
// @access  Private
router.put('/:id/read', protect, markRecommendationAsRead);

// @route   DELETE /api/recommendations/:id
// @desc    Delete a recommendation
// @access  Private
router.delete('/:id', protect, deleteRecommendation);

export default router;