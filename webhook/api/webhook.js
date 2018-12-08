const Router = require('express').Router;

/**
 * /api/webhook
 */
const router = Router();

router.post('/', (req, res) => {
    console.log('BODY');
    console.log(req.body);
    console.log('----------------');
    console.log('QUERY');
    console.log(req.query);
    console.log('----------------');
    console.log('HEADERS');
    console.log(req.headers);
    console.log('----------------');
    res.end();
});

module.exports = router;