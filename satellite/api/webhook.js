const Router = require('express').Router;
const axios = require('axios').default;
const logger = require('../config/logger');
/**
 * /api/webhook
 */
const router = Router();

const autoscalers = new Map();
const ORBITER_URL = 'http://devops_orbiter:8000/v1/orbiter';
const UPSCALING_INTERVAL = process.env.UPSCALING_INTERVAL || 10 * 1000;
const DOWNSCALING_INTERVAL = process.env.DOWNSCALING_INTERVAL || 5 * 1000;

router.use(async (req, res, next) => {
    logger.info('Fetching Orbiter services');
    await getOrbiterServices();
    next();
}); 

const getOrbiterServices = async (req, res) => {
    try {
        const { data } = await axios.get(`${ORBITER_URL}/autoscaler`);
        if (data.data) {
            for (const service of data.data) {
                if (autoscalers.has(service.name)) continue;
                autoscalers.set(service.name, {
                    name: service.name,
                    scalingCount: 0,
                    intervalId: null
                });
            }
            logger.info('Orbiter services fetched');
        } else {
            logger.warn('Orbiter returned no data!');
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
            if (!serviceName) {
                throw new Error('Service name not found');
            }
            const service = autoscalers.get(serviceName);
            if (service) {
                logger.info(`Requesting autoscaling for: ${service.name}`);
                
                const autoscaler = autoscalers.get(service.name);
                const intervalId = setInterval(async () => {
                    await axios.post(`${ORBITER_URL}/handle/${service.name}`, {
                        direction: true
                    });
                    autoscalers.set(service.name, {
                        ...autoscaler,
                        scalingCount: autoscaler.scalingCount + 1
                    });
                }, UPSCALING_INTERVAL);

                autoscalers.set(service.name, {
                    ...autoscaler,
                    intervalId
                });

                logger.info(`Successfully scaled ${service.name}`);
            } else {
                throw new Error('Service was not found on the list of Orbiter autoscalers');
            }
        } catch (e) {
            logger.error(e.message);
            logger.error(e.stack);
        }
    } else if (req.body.status === 'resolved') {
        logger.info('New rolved alert');
        try {
            if (!serviceName) {
                throw new Error('Resolving alert does not have a valid service name!');
            }
            logger.info(`Service ${serviceName} normalized. Decreasing number of replicas.`);
            const autoscaler = autoscalers.get(serviceName);
            if (!autoscaler) {
                throw new Error(`Service ${serviceName} was not found`);
            }
            // Stop upscaling
            clearInterval(autoscaler.intervalId);
            logger.info('Waiting 5s to start downscaling');
            await new Promise(resolve => setTimeout(resolve,  60 * 1000));

            // Start downscaling
            for (let i = 0; i < autoscaler.scalingCount; ++i) {
                try {
                    await axios.post(`${ORBITER_URL}/handle/${serviceName}`, {
                        direction: false
                    });
                    await new Promise(resolve => setTimeout(resolve, DOWNSCALING_INTERVAL));
                } catch (e) {
                    logger.error(e.message);
                    logger.error(e.stack);
                }
            }

            // Reset autoscaler
            autoscalers.set(serviceName, {
                ...autoscaler,
                scalingCount: 0,
                intervalId: null
            });
        } catch (e) {
            logger.error(e.message);
            logger.error(e.stack);
        }
    } else {
        logger.warn(`Unknown alert status ${req.body.status}`);
    }
    res.end();
});

module.exports = router;