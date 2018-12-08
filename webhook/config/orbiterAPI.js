const axios = require('axios');

const ORBITER_URL = 'devops_orbiter:8000/v1/orbiter';

module.exports = axios.default.create({
    baseURL: ORBITER_URL
});