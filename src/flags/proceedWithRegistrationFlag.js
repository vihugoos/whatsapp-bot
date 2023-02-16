module.exports = async function proceedWithRegistrationFlag(
    client,
    prisma,
    user,
    message
) {
    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "requestedFullName",
        },
    });

    client.sendMessage(message.to, "Por gentileza digite seu *nome* completo.");

    console.log(`\n[wpp-bot]: Client unlocked for registration: ${message.to}`);
};
