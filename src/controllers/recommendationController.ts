import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Property from '../models/Property';
import Recommendation from '../models/Recommendation';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create a new recommendation
 * @route POST /api/recommendations
 * @access Private
 */
export const createRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const { recipientEmail, propertyId, message } = req.body;

    if (!recipientEmail || !propertyId) {
      throw ApiError.badRequest('Recipient email and property ID are required');
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      throw ApiError.notFound('Property not found');
    }

    // Find recipient user by email
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      throw ApiError.notFound('Recipient user not found');
    }

    // Prevent self-recommendations
    if (req.user.userId === recipient.id.toString()) {
      throw ApiError.badRequest('Cannot recommend a property to yourself');
    }

    // Create the recommendation
    const recommendation = new Recommendation({
      sender: req.user.userId,
      recipient: recipient.id,
      property: propertyId,
      message: message || '',
      isRead: false
    });

    await recommendation.save();

    res.status(201).json({
      id: recommendation.id,
      sender: recommendation.sender,
      recipient: recommendation.recipient,
      property: recommendation.property,
      message: recommendation.message,
      isRead: recommendation.isRead,
      createdAt: recommendation.createdAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recommendations received by the user
 * @route GET /api/recommendations/received
 * @access Private
 */
export const getReceivedRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const recommendations = await Recommendation.find({ recipient: req.user.userId })
      .populate('sender', 'firstName lastName email')
      .populate('property')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Recommendation.countDocuments({ recipient: req.user.userId });

    res.json({
      recommendations,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recommendations sent by the user
 * @route GET /api/recommendations/sent
 * @access Private
 */
export const getSentRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const recommendations = await Recommendation.find({ sender: req.user.userId })
      .populate('recipient', 'firstName lastName email')
      .populate('property')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Recommendation.countDocuments({ sender: req.user.userId });

    res.json({
      recommendations,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a recommendation as read
 * @route PUT /api/recommendations/:id/read
 * @access Private
 */
export const markRecommendationAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      throw ApiError.notFound('Recommendation not found');
    }

    // Check if the user is the recipient
    if (recommendation.recipient.toString() !== req.user.userId) {
      throw ApiError.forbidden('Not authorized to update this recommendation');
    }

    recommendation.isRead = true;
    await recommendation.save();

    res.json({ message: 'Recommendation marked as read' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a recommendation
 * @route DELETE /api/recommendations/:id
 * @access Private
 */
export const deleteRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw ApiError.unauthorized();
    }

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      throw ApiError.notFound('Recommendation not found');
    }

    // Check if the user is either the sender or recipient
    if (
      recommendation.sender.toString() !== req.user.userId &&
      recommendation.recipient.toString() !== req.user.userId
    ) {
      throw ApiError.forbidden('Not authorized to delete this recommendation');
    }

    await recommendation.deleteOne();

    res.json({ message: 'Recommendation removed' });
  } catch (error) {
    next(error);
  }
};