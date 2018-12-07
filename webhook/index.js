const express = require('express');

const app = express();

app.use((req, res, next) => {
    console.log(`---- Request to ${req.path} ----`);
    next();
});

app.get('/health', (req, res) => {
    console.log('Service is up')
    res.json({up: true});
});

app.post('/alert', (req, res) => {
    console.log('BODY');
    console.log(req.body);
    res.end();
});

app.listen(3000, () => console.log('Server started on port 3000'));