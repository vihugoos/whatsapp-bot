const sendServiceOptions = require("../lib/sendServiceOptions");
const sleep = require("../utils/sleep");
const {
    sendNewNonCustomerContactToDiscordChannel,
} = require("../webhooks/discord");

module.exports = async function requestedCPFToConfirmPreviousRegistrationStage(
    client,
    prisma,
    user,
    message,
    chat
) {
    let cpfToConfirmTypedByUser = message.body.replace(/[^\d]+/g, "");

    if (cpfToConfirmTypedByUser.length != 11) {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "CPF digitado incorretamente (não possui 11 dígitos), por gentileza digite novamente."
        );
    } else {
        previous_registration = await prisma.users.findFirst({
            where: {
                cpf: cpfToConfirmTypedByUser,
            },
        });

        if (!previous_registration) {
            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "*CPF* não encontrado em nossa base de dados."
            );

            await sleep(1000);

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Por favor, aguarde alguns instantes que irei encaminha-lo a um de nossos atendentes para melhor análise do caso."
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
            await prisma.users.delete({
                where: {
                    id: user.id,
                },
            });

            userUpdated = await prisma.users.update({
                where: {
                    cpf: cpfToConfirmTypedByUser,
                },
                data: {
                    phone_number: user.phone_number,
                },
            });

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                `Dr(a) ${
                    userUpdated.name.split(" ")[0]
                }, seu novo número de celular foi atualizado com sucesso!`
            );

            await sleep(1000);

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Você já está habilitado(a) a requisitar nossos serviços novamente."
            );

            await sleep(1000);

            await sendServiceOptions(client, message, chat);

            await prisma.users.update({
                where: {
                    id: userUpdated.id,
                },
                data: {
                    stage: "requestedServiceNumber",
                },
            });
        }
    }
};
