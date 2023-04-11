module.exports = async function capturedSatisfactionSurvey(
    prisma,
    user,
    message
) {
    console.log("Verificando se o usuário respondeu a pesquisa...");

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

            return true;
        default:
            return false;
    }
    // } else {
    //     return false;
    // }
};
