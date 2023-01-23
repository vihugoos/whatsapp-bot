const { PrismaClient } = require("@prisma/client");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const prisma = new PrismaClient();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox"],
        headless: true,
    },
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("\n[chatbot-wpp]: Client is authenticated.");
});

client.on("auth_failure", (msg) => {
    console.error("\n[chatbot-wpp]: Authentication Failure:", msg);
});

client.on("ready", () => {
    console.log("\n[chatbot-wpp]: Client connected successfully.");
});

client.on("disconnected", (reason) => {
    console.log("\n[chatbot-wpp]: Client was logged out.", reason);
});

client.on("message", async (message) => {
    console.log("\n[chatbot-wpp]: Message typed by the user:", message.body);

    identifyUserByPhoneNumber(message);
});

async function identifyUserByPhoneNumber(message) {
    const phone_number = (await message.getContact()).number;

    let user = await prisma.users.findFirst({
        where: {
            phone_number,
        },
    });

    if (!user) {
        user = await prisma.users.create({
            data: {
                phone_number,
            },
        });
    }

    console.log("\n[chatbot-wpp]: Current user:", user);

    checkUserStages(user, message);
}

var userStagesSession = [];

async function checkUserStages(user, message) {
    if (userStagesSession[message.from] == undefined) {
        if (user.name) {
            client.sendMessage(
                message.from,
                `Olá ${user.name}, eu sou a assistente virtual da *Liber*, estou aqui para auxiliá-lo(a) no seu atendimento.`
            );
        } else {
            client.sendMessage(
                message.from,
                "Olá, eu sou a assistente virtual da *Liber*, estou aqui para auxiliá-lo(a) no seu atendimento."
            );
        }
    }

    if (user.name == null) {
        if (userStagesSession[message.from] == undefined) {
            client.sendMessage(
                message.from,
                "Checamos no nosso sistema que você ainda não possui um cadastro, vamos dar prosseguimento no cadastro por aqui mesmo, iremos apenas precisar de algumas informações."
            );

            client.sendMessage(
                message.from,
                "Digite seu *NOME* completo por favor."
            );

            userStagesSession[message.from] = "nome";
        } else {
            user.name = message.body;

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    name: user.name,
                },
            });

            client.sendMessage(message.from, `Obrigado, ${message.body}!`);

            client.sendMessage(message.from, "Por gentiliza digite seu *CPF*.");

            userStagesSession[message.from] = "cpf";
        }
    } else if (user.cpf === null) {
        if (userStagesSession[message.from] == undefined) {
            client.sendMessage(message.from, "Por gentiliza digite seu *CPF*.");

            userStagesSession[message.from] = "cpf";
        } else {
            user.cpf = message.body.replace(/[^\d]+/g, "");

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    cpf: user.cpf,
                },
            });

            client.sendMessage(message.from, "Obrigado por informar seu CPF.");

            client.sendMessage(
                message.from,
                "Digite o número do serviço desejado:\n\n*1*. Serviço A\n*2*. Serviço B\n*3*. Serviço C\n*4*. Serviço D\n*5*. Serviço E"
            );

            userStagesSession[message.from] = "services";
        }
    } else if (userStagesSession[message.from] == undefined) {
        if (userStagesSession[message.from] == undefined) {
            userStagesSession[message.from] = "services";
        }

        client.sendMessage(
            message.from,
            "Digite o número de alguns dos nossos serviços disponíveis:\n\n*1*. Serviço A\n*2*. Serviço B\n*3*. Serviço C\n*4*. Serviço D\n*5*. Serviço E"
        );
    } else if (userStagesSession[message.from] == "services") {
        client.sendMessage(
            message.from,
            `Você escolheu o serviço de número ${message.body}.`
        );

        client.sendMessage(
            message.from,
            "Aguarde alguns instantes que irei encaminha-lo para algum dos nossos atendentes, você será atendido em breve."
        );

        userStagesSession[message.from] = "in_attendance";
    }
}

client.initialize();
