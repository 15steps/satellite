const Router = require('express').Router;
const orbiterAPI = require('../config/orbiterAPI');

/**
 * /api/webhook
 */
const router = Router();

const serviceList = [];

router.use(async (req, res, next) => {
    if (serviceList.length === 0) {
        console.log('Atualizando lista de servicos do orbiter');
        await getOrbiterServices();
    }
    next();
});

const getOrbiterServices = async (req, res) => {
    try {
        const { data } = await orbiterAPI.get('/autoscaler');
        if (data.data) {
            serviceList = data.data.map(service => {
                return {
                    name: service.name,
                    replicas: 0
                }
            });
            console.log('Lista de servicos atualizada');
            console.log(serviceList);
        }
    } catch (e) {
        console.log(e);
    }
}

router.post('/', async (req, res) => {
    const { 
        container_label_com_docker_swarm_service_name: incomingServiceName 
    } = req.body.commonLabels;
    console.log('Novo alerta disparado');
    if (req.body.status === 'firing') {
        try {
            console.log('Enviando request p/ Orbiter');
            const service = serviceList.filter(service => service.name === incomingServiceName)[0];
            if (service) {
                await orbiterAPI.post(`/handle/${service.name}`, {
                    direction: true
                });
                console.log('Req p/ orbiter enviada com sucesso');
            }
        } catch (e) {
            console.log('Error while autoscaling service');
            console.log(e);
        }
    }
    res.end();
});

module.exports = router;