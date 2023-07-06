const userStageController = require("./userStageController");

module.exports = async function identifyUserByPhoneNumberController(
    client,
    prisma,
    message
) {
    if (message.from === "status@broadcast") return;

    if (message.body == "") return;

    const { id } = await message.getContact();

    const phone_number = id.user;

    let user = await prisma.users.findFirst({
        where: {
            phone_number,
        },
    });

    if (!user) {
        console.log("\n[wpp-bot]: User does not exists, creating...");

        user = await prisma.users.create({
            data: {
                phone_number,
                created_at: new Date().toLocaleString("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                }),
            },
        });
    }

    console.log("\n[wpp-bot]: User stage:", user.stage);
    console.log(`[wpp-bot]: Message from ${message.from}:`, message.body);
    console.log("[wpp-bot]: User ID:", user.id);

    let chat = await message.getChat();

    if (!user.stage === "in_attendance") {
        chat.sendSeen();
    }

    await userStageController(client, prisma, user, message, chat);
};
