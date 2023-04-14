const sleep = require("../utils/sleep");

module.exports = async function capturedSatisfactionSurvey(
    client,
    prisma,
    user,
    message,
    chat
) {
    const validateIfIsNumber = /^\d+$/;

    // if (message.hasQuotedMsg) {
    switch (message.body) {
        // case "Ruim":
        case "1":
            console.log(
                `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                    user.name.split(" ")[0]
                } answered 'Ruim'`
            );

            const option_1 = await prisma.solicitations.findFirst({
                where: {
                    user_id: user.id,
                },
                orderBy: {
                    bot_end_at: "desc",
                },
            });

            await prisma.solicitations.update({
                where: {
                    id: option_1.id,
                },
                data: {
                    satisfaction: "Ruim",
                },
            });

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Obrigado pelo feedback Dr(a), até a próxima!"
            );

            return true;
        // case "Bom":
        case "2":
            console.log(
                `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                    user.name.split(" ")[0]
                } answered 'Bom'`
            );

            const option_2 = await prisma.solicitations.findFirst({
                where: {
                    user_id: user.id,
                },
                orderBy: {
                    bot_end_at: "desc",
                },
            });

            await prisma.solicitations.update({
                where: {
                    id: option_2.id,
                },
                data: {
                    satisfaction: "Bom",
                },
            });

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Obrigado pelo feedback Dr(a), até a próxima!"
            );

            return true;
        // case "Muito bom":
        case "3":
            console.log(
                `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                    user.name.split(" ")[0]
                } answered 'Muito bom'`
            );

            const option_3 = await prisma.solicitations.findFirst({
                where: {
                    user_id: user.id,
                },
                orderBy: {
                    bot_end_at: "desc",
                },
            });

            await prisma.solicitations.update({
                where: {
                    id: option_3.id,
                },
                data: {
                    satisfaction: "Muito bom",
                },
            });

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Obrigado pelo feedback Dr(a), até a próxima!"
            );

            return true;
        default:
            if (validateIfIsNumber.test(message.body)) {
                chat.sendStateTyping();

                await sleep(1500);

                client.sendMessage(
                    message.from,
                    "Caso esteja respondendo a pesquisa de satisfação, por gentiliza digite um dos números acima."
                );

                return true;
            }

            return false;
    }
    // } else {
    //     return false;
    // }
};
