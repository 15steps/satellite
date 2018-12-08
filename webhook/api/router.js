const Router = require('express').Router;

const router = Router();
const webhookRouter = require('./webhook');
const infoRouter = require('./info');

router.use('/webhook', webhookRouter);
router.use('/info', infoRouter);

module.exports = router;