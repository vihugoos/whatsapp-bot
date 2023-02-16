const { Buttons } = require("whatsapp-web.js");
const sleep = require("../utils/sleep");

module.exports = async function userWithoutRegistrationWithoutSessionStage(
    client,
    prisma,
    user,
    message
) {
    client.sendMessage(
        message.from,
        "Olá! Eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻"
    );

    await sleep(1000);

    client.sendMessage(
        message.from,
        "Verifiquei que esse número não está cadastrado em nosso sistema."
    );

    await sleep(1000);

    const buttons = new Buttons(
        "Selecione uma das opções abaixo.",
        [{ body: "Já sou cliente Liber" }, { body: "Não sou cliente" }],
        "Pré-atendimento Automático",
        "Liber Assessoria & Soluções"
    );

    client.sendMessage(message.from, buttons);

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "askedIfAlreadyClientLiber",
        },
    });
};
