const Router = require('express').Router;

const router = Router();

router.get('/health', (req, res) => res.status(200).json({up: true}));

module.exports = router;