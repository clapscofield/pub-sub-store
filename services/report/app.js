const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}

function hasOrders(deliveryData) {
    return Array.isArray(deliveryData.products) && deliveryData.products.length > 0
}

async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function processMessage(msg) {
    const deliveryData = JSON.parse(msg.content)
    try {
        if (hasProducts(deliveryData)) {
            updateReport(deliveryData.products)
            printReport()
            console.log(`✔ RELATÓRIO GERADO`)
        } else {
            console.log(`X NÃO É POSSÍVEL GERAR RELATÓRIO DE PEDIDO SEM PRODUTOS`)
        }
    } catch (error) {
        console.log(`X ERROR TO PROCESS: ${error.response}`)
    }
}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} vendas`);
      }
}

async function consume() {
    console.log(`INSCRITO COM SUCESSO NA FILA: ${process.env.RABBITMQ_QUEUE_NAME}`)
    await (await RabbitMQService.getInstance()).consume(process.env.RABBITMQ_QUEUE_NAME, (msg) => {processMessage(msg)})
}

consume()
