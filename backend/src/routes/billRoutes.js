const express = require('express');
const {
    getBills,
    getBill,
    getBillByNumber,
    getBillByTableNumber, // Add this
    createBill,
    addItemsToBill,
    closeBill
} = require('../controllers/billController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getBills);
router.get('/number/:billNumber', getBillByNumber);
router.get('/table/:tableNumber', getBillByTableNumber); // Add this line
router.get('/:id', getBill);
router.post('/', protect, createBill);
router.post('/:id/items', protect, addItemsToBill);
router.put('/:id/close', protect, closeBill);

module.exports = router;