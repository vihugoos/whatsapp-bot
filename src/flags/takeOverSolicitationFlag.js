module.exports = async function takeOverSolicitationFlag(
    prisma,
    user,
    message
) {
    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "in_attendance",
        },
    });

    console.log(
        `\n[wpp-bot]: Customer placed in attendance immediately: ${message.to}`
    );
};
