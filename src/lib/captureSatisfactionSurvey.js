module.exports = async function captureSatisfactionSurvey(
    prisma,
    user,
    message
) {
    if (message.hasQuotedMsg) {
        switch (message.body) {
            case "Muito bom":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'muito bom'`
                );

                await prisma.surveys.create({
                    data: {
                        user_id: user.id,
                        answer: "muito bom",
                    },
                });

                return true;
            case "Bom":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'bom'`
                );

                await prisma.surveys.create({
                    data: {
                        user_id: user.id,
                        answer: "bom",
                    },
                });

                return true;
            case "Ruim":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'ruim'`
                );

                await prisma.surveys.create({
                    data: {
                        user_id: user.id,
                        answer: "ruim",
                    },
                });

                return true;
            default:
                return false;
        }
    } else {
        return false;
    }
};
