const sendServiceOptions = require("../lib/sendServiceOptions");

module.exports = async function userAlreadyRegisteredWithoutSessionStage(
    client,
    prisma,
    user,
    message
) {
    // Verify if user answered satisfaction survey
    if (message.hasQuotedMsg) {
        let answer;

        switch (message.body) {
            case "Muito bom":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'muito bom'`
                );

                answer = await prisma.surveys.create({
                    data: {
                        user_id: user.id,
                        answer: "muito bom",
                    },
                });

                console.log("[bot-wpp]: Survey ID:", answer.id);

                return;
            case "Bom":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'bom'`
                );

                answer = await prisma.surveys.create({
                    data: {
                        user_id: user.id,
                        answer: "bom",
                    },
                });

                console.log("[bot-wpp]: Survey ID:", answer.id);

                return;
            case "Ruim":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'ruim'`
                );

                answer = await prisma.surveys.create({
                    data: {
                        user_id: user.id,
                        answer: "ruim",
                    },
                });

                console.log("[bot-wpp]: Survey ID:", answer.id);

                return;
            default:
                console.log(
                    "\n[wpp-bot]: Satisfaction survey, answer not found!"
                );
        }
    }

    client.sendMessage(
        message.from,
        `Olá Dr(a) ${
            user.name.split(" ")[0]
        }, eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻`
    );

    sendServiceOptions(client, message);

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "requestedServiceNumber",
        },
    });
};
