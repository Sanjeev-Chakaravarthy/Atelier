const express = require('express');
const { getOverview, getVelocity, getHeatmap, getDistribution, getActivity } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/overview', getOverview);
router.get('/velocity', getVelocity);
router.get('/heatmap', getHeatmap);
router.get('/distribution', getDistribution);
router.get('/activity', getActivity);

module.exports = router;
