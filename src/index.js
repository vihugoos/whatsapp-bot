const { Client, LocalAuth, Buttons } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const identifyUserByPhoneNumberController = require("./controllers/identifyUserByPhoneNumberController");
const rejectCalls = require("./lib/rejectCalls");

const prisma = require("./database/prisma-client");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox"],
        headless: true,
    },
});

client.initialize();

client.on("loading_screen", (percent) => {
    console.log(`\n[wpp-bot]: Loading screen... ${percent}% percent`);
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("\n[wpp-bot]: Client is authenticated");
});

client.on("auth_failure", (msg) => {
    console.error("\n[wpp-bot]: Authentication failure:", msg);
});

client.on("ready", () => {
    console.log("\n[wpp-bot]: Client connected successfully");
});

client.on("message", async (message) => {
    identifyUserByPhoneNumberController(client, prisma, message);
});

client.on("message_create", async (message) => {
    if (message.fromMe) {
        const phone_number = message.to.replace(/[^\d]+/g, "");

        const user = await prisma.users.findFirst({
            where: {
                phone_number,
            },
        });

        if (message.body.toLowerCase().includes("atendimento finalizado")) {
            console.log("\n[wpp-bot]: Function attendance ended called");

            if (user.email) {
                const solicitation = await prisma.solicitations.findFirst({
                    where: {
                        user_id: user.id,
                        AND: {
                            open: true,
                        },
                    },
                });

                if (solicitation) {
                    const solicitationClosed =
                        await prisma.solicitations.update({
                            where: {
                                id: solicitation.id,
                            },
                            data: {
                                open: false,
                                end_at: new Date(),
                            },
                        });

                    console.log("\n[wpp-bot]: Solicitation closed");
                    console.log(
                        "[wpp-bot]: Solicitation ID:",
                        solicitationClosed.id
                    );

                    const satisfactionSurvey = new Buttons(
                        "Ajude-nos a melhorar nossos serviços e atendimento respondendo à nossa pesquisa de satisfação. Sua colaboração é muito importante para nós.\nObrigado! 🩺✅",
                        [
                            { body: "Ruim" },
                            { body: "Bom" },
                            { body: "Muito bom" },
                        ],
                        "Pesquisa de Satisfação",
                        "Liber Assessoria & Soluções"
                    );

                    client.sendMessage(message.to, satisfactionSurvey);

                    console.log(
                        `\n[wpp-bot]: Satisfaction survey sent to ${message.to}`
                    );
                } else {
                    console.log("\n[wpp-bot]: Solicitation does not found");
                }
            } else {
                console.log(
                    "\n[wpp-bot]: User does not have a registered account"
                );
            }

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: null,
                },
            });

            console.log(`\n[wpp-bot]: Attendance ended for ${message.to}`);
        }

        if (
            message.body
                .toLowerCase()
                .includes("prosseguimento no seu cadastro")
        ) {
            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: "requestedFullName",
                },
            });

            client.sendMessage(
                message.to,
                "Por gentileza digite seu *nome* completo."
            );

            console.log(
                `\n[wpp-bot]: Client unlocked for registration: ${message.to}`
            );
        }
    }
});

client.on("group_join", (notification) => {
    console.log("\n[wpp-bot]: bot joined the group:", notification);
});

client.on("call", async (call) => {
    rejectCalls(client, call);
});

client.on("change_state", (state) => {
    console.log("\n[wpp-bot]: Changed state, new status connection:", state);
});

client.on("disconnected", (reason) => {
    console.log("\n[wpp-bot]: Client was logged out", reason);
});
