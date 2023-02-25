const sleep = require("../utils/sleep");

module.exports = async function requestedRGStage(
    client,
    prisma,
    user,
    message,
    chat
) {
    rgTypedByUser = message.body.replace(/[^\d]+/g, "");

    if (rgTypedByUser.length != 9) {
        chat.sendStateTyping();

        await sleep(1500);

        client.sendMessage(
            message.from,
            "RG inválido (não possui 9 dígitos), por gentileza digite novamente."
        );
    } else {
        const RGAlreadyExists = await prisma.users.findFirst({
            where: {
                rg: rgTypedByUser,
            },
        });

        if (RGAlreadyExists) {
            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Esse RG já existe em nosso sistema, por favor, tente novamente."
            );
        } else {
            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    rg: rgTypedByUser,
                },
            });

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(message.from, "Digite seu *E-mail*.");

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: "requestedEmail",
                },
            });
        }
    }
};
