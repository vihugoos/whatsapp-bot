module.exports = function sendServiceOptions(client, message) {
    client.sendMessage(
        message.from,
        "Digite o número do serviço desejado:\n\n*1*. Veículo\n*2*. Casa\n*3*. Atualizações\n*4*. Viagens\n*5*. Cancelamentos & Assinaturas\n*6*. Agendamentos\n*7*. Outros"
    );
};
