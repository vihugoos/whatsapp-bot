const sendSatisfactionSurvey = require("../lib/sendSatisfactionSurvey");

module.exports = async function endedAttendanceFlag(
    client,
    prisma,
    user,
    message
) {
    console.log("\n[wpp-bot]: endedAttendanceFlag() called");

    const USER_HAS_REGISTRATION = user.cpf;

    if (USER_HAS_REGISTRATION) {
        const solicitation = await prisma.solicitations.findFirst({
            where: {
                user_id: user.id,
                AND: {
                    open: true,
                },
            },
        });

        if (solicitation) {
            const solicitationClosed = await prisma.solicitations.update({
                where: {
                    id: solicitation.id,
                },
                data: {
                    open: false,
                    end_at: new Date().toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo",
                    }),
                    bot_end_at: new Date(),
                },
            });

            console.log("\n[wpp-bot]: Solicitation closed");
            console.log("[wpp-bot]: Solicitation ID:", solicitationClosed.id);

            if (solicitationClosed.attendant_id) {
                await prisma.attendants.update({
                    where: {
                        id: solicitationClosed.attendant_id,
                    },
                    data: {
                        in_attendance: false,
                    },
                });
            }

            await sendSatisfactionSurvey(client, message);
        } else {
            console.log("\n[wpp-bot]: Solicitation does not found");
        }
    } else {
        console.log("\n[wpp-bot]: User does not have a registered account");
    }

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: null,
        },
    });

    console.log(`\n[wpp-bot]: Ended attendance for ${message.to}`);
};
