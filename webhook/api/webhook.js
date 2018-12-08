const Router = require('express').Router;
const orbiterAPI = require('../config/orbiterAPI');
const axios = require('axios').default;
/**
 * /api/webhook
 */
const router = Router();

let serviceList = [];

router.use(async (req, res, next) => {
    if (serviceList.length === 0) {
        console.log('Atualizando lista de servicos do orbiter');
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
            console.log('Lista de servicos atualizada');
            console.log(serviceList);
        }
    } catch (e) {
        console.log(e);
    }
}

router.post('/', async (req, res) => {
    const { 
        serviceName
    } = req.body.commonAnnotations;
    console.log('Novo alerta disparado');
    if (req.body.status === 'firing') {
        try {
            const service = serviceList.filter(service => service.name === serviceName)[0];
            // const service = serviceList[0];
            console.log(`Escalando servico: ${service}`);
            if (service) {
                await axios.post(`http://devops_orbiter:8000/v1/orbiter/handle/${service.name}`, {
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