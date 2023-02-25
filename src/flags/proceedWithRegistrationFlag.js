const sleep = require("../utils/sleep");

module.exports = async function proceedWithRegistrationFlag(
    client,
    prisma,
    user,
    message,
    chat
) {
    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "requestedFullName",
        },
    });

    chat.sendStateTyping();

    await sleep(1500);

    client.sendMessage(message.to, "Por gentileza digite seu *nome* completo.");

    console.log(`\n[wpp-bot]: Client unlocked for registration: ${message.to}`);
};
