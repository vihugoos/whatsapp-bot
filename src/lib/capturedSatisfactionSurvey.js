module.exports = async function capturedSatisfactionSurvey(
    prisma,
    user,
    message
) {
    if (message.hasQuotedMsg) {
        switch (message.body) {
            case "Ruim":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'ruim'`
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
                        satisfaction: "ruim",
                    },
                });

                return true;
            case "Bom":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'bom'`
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
                        satisfaction: "bom",
                    },
                });

                return true;
            case "Muito bom":
                console.log(
                    `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                        user.name.split(" ")[0]
                    } answered 'muito bom'`
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
                        satisfaction: "muito bom",
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
