const sendServiceOptions = require("../lib/sendServiceOptions");
const isOutsideBusinessHours = require("../lib/isOutsideBusinessHours");
const sleep = require("../utils/sleep");

module.exports = async function userAlreadyRegisteredWithoutSessionStage(
    client,
    prisma,
    user,
    message,
    chat
) {
    chat.sendStateTyping();

    await sleep(1500);

    client.sendMessage(
        message.from,
        `Olá Dr(a) ${
            user.name.split(" ")[0]
        }, eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻`
    );

    await sleep(1000);

    if (isOutsideBusinessHours()) {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "*Estamos fora do horário comercial, mas farei um pré-atendimento para agilizar sua solicitação. Um atendente assumirá assim que disponível, com todas as informações necessárias para continuar o atendimento.*"
        );

        await sleep(1000);
    }

    chat.sendStateTyping();

    await sleep(1500);

    await sendServiceOptions(client, message, chat);

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "requestedServiceNumber",
        },
    });
};
