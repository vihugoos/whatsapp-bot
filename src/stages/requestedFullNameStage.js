const convertToTitleCase = require("../utils/convertToTitleCase");
const sleep = require("../utils/sleep");

module.exports = async function requestedFullNameStage(
    client,
    prisma,
    user,
    message
) {
    let nameTypedByUser = message.body.replace(/[^a-zA-Z ]/g, "");

    nameTypedByUser = convertToTitleCase(nameTypedByUser);

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            name: nameTypedByUser,
        },
    });

    client.sendMessage(
        message.from,
        `Obrigado, Dr(a) ${nameTypedByUser.split(" ")[0]}!`
    );

    await sleep(1000);

    client.sendMessage(message.from, "Digite seu *CPF*.");

    await prisma.users.update({
        where: {
            id: user.id,
        },
        data: {
            stage: "requestedCPF",
        },
    });
};
