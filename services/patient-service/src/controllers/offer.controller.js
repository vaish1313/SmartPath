const Offer = require('../models/Offer');

// Get all active offers (for public display)
exports.getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      validFrom: { $lte: now },
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    })
      .sort({ priority: -1, createdAt: -1 })
      .select('-__v');

    res.json({ success: true, offers });
  } catch (error) {
    console.error('Get active offers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers' });
  }
};

// Get all offers (admin)
exports.getAllOffers = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const offers = await Offer.find()
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Offer.countDocuments();

    res.json({
      success: true,
      offers,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get all offers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offers' });
  }
};

// Get single offer
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, offer });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch offer' });
  }
};

// Create offer
exports.createOffer = async (req, res) => {
  try {
    const { text, icon, color, priority, isActive, validFrom, validUntil } = req.body;

    const offer = await Offer.create({
      text,
      icon,
      color,
      priority,
      isActive,
      validFrom,
      validUntil,
    });

    res.status(201).json({ success: true, offer });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to create offer' });
  }
};

// Update offer
exports.updateOffer = async (req, res) => {
  try {
    const { text, icon, color, priority, isActive, validFrom, validUntil } = req.body;

    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      { text, icon, color, priority, isActive, validFrom, validUntil },
      { new: true, runValidators: true }
    );

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.json({ success: true, offer });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to update offer' });
  }
};

// Delete offer
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    res.json({ success: true, message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete offer' });
  }
};
