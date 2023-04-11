const { Buttons } = require("whatsapp-web.js");
const sleep = require("../utils/sleep");

module.exports = async function userWithoutRegistrationWithoutSessionStage(
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
        "Olá! Eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻"
    );

    await sleep(1000);

    chat.sendStateTyping();

    await sleep(1500);

    client.sendMessage(
        message.from,
        "Verifiquei que esse número não está cadastrado em nosso sistema."
    );

    await sleep(1000);

    chat.sendStateTyping();

    await sleep(1500);

    // const buttons = new Buttons(
    //     "Selecione uma das opções abaixo.",
    //     [{ body: "Já sou cliente Liber" }, { body: "Não sou cliente" }],
    //     "Pré-atendimento Automático",
    //     "Liber Assessoria & Soluções"
    // );

    // client.sendMessage(message.from, buttons);

    // Code temporary
    client.sendMessage(
        message.from,
        "Escolha uma das opções:\n\n*1*. Já sou cliente Liber\n*2*. Não sou cliente"
    );

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "askedIfAlreadyClientLiber",
        },
    });
};
