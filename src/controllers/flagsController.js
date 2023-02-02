const endedAttendanceFlag = require("../flags/endedAttendanceFlag");
const proceedWithRegistrationFlag = require("../flags/proceedWithRegistrationFlag");

module.exports = async function flagsController(client, prisma, message) {
    if (message.fromMe) {
        const phone_number = message.to.replace(/[^\d]+/g, "");

        const user = await prisma.users.findFirst({
            where: {
                phone_number,
            },
        });

        if (message.body.toLowerCase().includes("atendimento finalizado")) {
            endedAttendanceFlag(client, prisma, user, message);
        }

        if (
            message.body
                .toLowerCase()
                .includes("prosseguimento no seu cadastro")
        ) {
            proceedWithRegistrationFlag(client, prisma, user, message);
        }
    }
};
