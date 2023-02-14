const sendServiceOptions = require("../lib/sendServiceOptions");

module.exports = async function userAlreadyRegisteredWithoutSessionStage(
    client,
    prisma,
    user,
    message
) {
    await client.sendMessage(
        message.from,
        `Olá Dr(a) ${
            user.name.split(" ")[0]
        }, eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻`
    );

    await sendServiceOptions(client, message);

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "requestedServiceNumber",
        },
    });
};
