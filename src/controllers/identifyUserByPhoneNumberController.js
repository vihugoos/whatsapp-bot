const userStageController = require("./userStageController");

module.exports = async function identifyUserByPhoneNumberController(
    client,
    prisma,
    message
) {
    if (message.from === "status@broadcast") return;

    if (message.body == "") return;

    const phone_number = (await message.getContact()).number;

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
            },
        });
    }

    console.log("\n[wpp-bot]: User stage:", user.stage);
    console.log(`[wpp-bot]: Message from ${message.from}:`, message.body);
    console.log("[wpp-bot]: User ID:", user.id);

    await userStageController(client, prisma, user, message);
};
