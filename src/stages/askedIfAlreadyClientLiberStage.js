const {
    sendNewNonCustomerContactToDiscordChannel,
} = require("../webhooks/discord");
const sleep = require("../utils/sleep");

module.exports = async function askedIfAlreadyClientLiberStage(
    client,
    prisma,
    user,
    message,
    chat
) {
    // if (message.body === "Já sou cliente Liber") {
    if (message.body === "1") {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "Por favor, informe seu *CPF* para confirmação."
        );

        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                stage: "requestedCPFToConfirmPreviousRegistration",
            },
        });
        // } else if (message.body === "Não sou cliente") {
    } else if (message.body === "2") {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "Por favor, aguarde alguns instantes enquanto nosso representante comercial entra em contato."
        );

        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                stage: "in_attendance",
            },
        });

        await sendNewNonCustomerContactToDiscordChannel(
            user.id,
            user.phone_number
        );
    } else {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "Resposta inválida, por gentileza selecione uma das opções acima."
        );
    }
};
