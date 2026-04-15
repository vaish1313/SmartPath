const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');

// Public route - get active offers
router.get('/active', offerController.getActiveOffers);

// Admin routes
router.get('/', offerController.getAllOffers);
router.get('/:id', offerController.getOfferById);
router.post('/', offerController.createOffer);
router.put('/:id', offerController.updateOffer);
router.delete('/:id', offerController.deleteOffer);

module.exports = router;
