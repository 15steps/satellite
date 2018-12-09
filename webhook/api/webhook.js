const Router = require('express').Router;
const orbiterAPI = require('../config/orbiterAPI');
const axios = require('axios').default;
const logger = require('../config/logger');
/**
 * /api/webhook
 */
const router = Router();

let serviceList = [];

router.use(async (req, res, next) => {
    if (serviceList.length === 0) {
        logger.info('Fetching Orbiter services');
        await getOrbiterServices();
    }
    next();
}); 

const getOrbiterServices = async (req, res) => {
    try {
        const { data } = await axios.get('http://devops_orbiter:8000/v1/orbiter/autoscaler');
        if (data.data) {
            serviceList = data.data.map(service => {
                return {
                    name: service.name,
                    replicas: 0
                }
            });
            logger.info('Orbiter services fetched');
        }
    } catch (e) {
        logger.error('Error while fetching Orbiter autoscalers');
        logger.error(e.stack);
    }
}

router.post('/', async (req, res) => {
    const { 
        serviceName
    } = req.body.commonAnnotations;
    if (req.body.status === 'firing') {
        logger.info('New firing alert');
        try {
            const service = serviceList.find(service => service.name === serviceName);
            logger.info(`Requesting autoscaling for: ${service.name}`);
            if (service) {
                await axios.post(`http://devops_orbiter:8000/v1/orbiter/handle/${service.name}`, {
                    direction: true
                });
                logger.info(`Successfully scaled ${service.name}`);
            } else {
                logger.warn('Service was not found on the list of Orbiter autoscalers');
            }
        } catch (e) {
            logger.error('Error while autoscaling service');
            logger.error(e.stack);
        }
    } else {
        logger.info('New rolved alert');
    }
    res.end();
});

module.exports = router;