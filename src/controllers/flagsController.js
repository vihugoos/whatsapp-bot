const endedAttendanceFlag = require("../flags/endedAttendanceFlag");
const proceedWithRegistrationFlag = require("../flags/proceedWithRegistrationFlag");
const takeOverSolicitationFlag = require("../flags/takeOverSolicitationFlag");

module.exports = async function flagsController(client, prisma, message) {
    if (message.fromMe) {
        let chat = await message.getChat();

        const phone_number = message.to.replace(/[^\d]+/g, "");

        const user = await prisma.users.findFirst({
            where: {
                phone_number,
            },
        });

        if (message.body.toLowerCase().includes("atendimento finalizado")) {
            await endedAttendanceFlag(client, prisma, user, message, chat);
        }

        if (
            message.body
                .toLowerCase()
                .includes("prosseguimento no seu cadastro")
        ) {
            await proceedWithRegistrationFlag(
                client,
                prisma,
                user,
                message,
                chat
            );
        }

        if (message.body.toLowerCase().includes("em que posso ajudar")) {
            await takeOverSolicitationFlag(prisma, user, message);
        }
    }
};
