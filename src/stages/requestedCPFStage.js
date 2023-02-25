const sleep = require("../utils/sleep");

module.exports = async function requestedCPFStage(
    client,
    prisma,
    user,
    message,
    chat
) {
    let cpfTypedByUser = message.body.replace(/[^\d]+/g, "");

    if (cpfTypedByUser.length != 11) {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "CPF inválido (não possui 11 dígitos), por gentileza digite novamente."
        );
    } else {
        const CPFAlreadyExists = await prisma.users.findFirst({
            where: {
                cpf: cpfTypedByUser,
            },
        });

        if (CPFAlreadyExists) {
            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Esse CPF já existe em nosso sistema, por favor, tente novamente."
            );
        } else {
            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    cpf: cpfTypedByUser,
                },
            });

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(message.from, "Digite seu *RG*.");

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: "requestedRG",
                },
            });
        }
    }
};
