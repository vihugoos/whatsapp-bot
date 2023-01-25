const { PrismaClient } = require("@prisma/client");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const prisma = new PrismaClient();

var userStages = [];

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
    console.log(
        `\n[chatbot-wpp]: New message from ${message.from}:`,
        message.body
    );

    identifyUserByPhoneNumber(message);
});

client.on("message_create", (message) => {
    if (message.fromMe) {
        if (message.body.toLowerCase().includes("atendimento finalizado")) {
            userStages[message.to] = undefined;

            console.log(`\n[chatbot-wpp]: Attendance ended for ${message.to}`);
        }
    }
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

    console.log("[chatbot-wpp]: User ID:", user.id);

    checkUserStages(user, message);
}

async function checkUserStages(user, message) {
    if (userStages[message.from] == undefined) {
        if (user.name) {
            client.sendMessage(
                message.from,
                `Olá ${
                    user.name.split(" ")[0]
                }, eu sou a assistente virtual da Liber, estou aqui para auxiliá-lo(a) no seu atendimento.`
            );
        } else {
            client.sendMessage(
                message.from,
                "Olá, eu sou a assistente virtual da Liber, estou aqui para auxiliá-lo(a) no seu atendimento."
            );
        }
    }

    if (user.name == null) {
        if (userStages[message.from] == undefined) {
            client.sendMessage(
                message.from,
                "Já possui um cadastro? Digite *'sim'* ou *'não'*."
            );

            userStages[message.from] = "askedIfAlreadyRegistered";
        } else if (userStages[message.from] === "askedIfAlreadyRegistered") {
            let messageFromUser = message.body
                .replace(/[ìí]/gi, "i")
                .replace(/[ã]/gi, "a")
                .toLowerCase();

            if (messageFromUser === "sim") {
                client.sendMessage(
                    message.from,
                    "Apenas para confirmação, por gentiliza digite seu *CPF*."
                );

                userStages[message.from] = "userAlreadyHasAnAccount";
            } else if (messageFromUser === "nao") {
                client.sendMessage(
                    message.from,
                    "Vamos dar prosseguimento no cadastro por aqui mesmo, iremos apenas precisar de algumas informações."
                );

                client.sendMessage(
                    message.from,
                    "Digite seu *NOME* completo por favor."
                );

                userStages[message.from] = "requestedFullName";
            } else {
                console.log("Reposta inválida, por favor, tente novamente.");
            }
        } else if (userStages[message.from] === "userAlreadyHasAnAccount") {
            user.cpf = message.body.replace(/[^\d]+/g, "");

            if (user.cpf.length != 11) {
                client.sendMessage(
                    message.from,
                    "CPF inválido, por gentileza digite novamente."
                );
            } else {
                previous_registration = await prisma.users.findFirst({
                    where: {
                        cpf: user.cpf,
                    },
                });

                await prisma.users.delete({
                    where: {
                        id: previous_registration.id,
                    },
                });

                user = await prisma.users.update({
                    where: {
                        phone_number: user.phone_number,
                    },
                    data: {
                        name: previous_registration.name,
                        cpf: previous_registration.cpf,
                    },
                });

                client.sendMessage(
                    message.from,
                    `${
                        user.name.split(" ")[0]
                    }, seu novo número de celular foi atualizado com sucesso!`
                );

                client.sendMessage(
                    message.from,
                    "Digite o número do serviço desejado:\n\n*1*. Serviço A\n*2*. Serviço B\n*3*. Serviço C\n*4*. Serviço D\n*5*. Serviço E"
                );

                userStages[message.from] = "requestedServiceNumber";
            }
        } else if (userStages[message.from] === "requestedFullName") {
            user.name = message.body.replace(/[^a-zA-Z ]/g, "");

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    name: user.name,
                },
            });

            client.sendMessage(
                message.from,
                `Obrigado, ${user.name.split(" ")[0]}!`
            );

            client.sendMessage(message.from, "Por gentiliza digite seu *CPF*.");

            userStages[message.from] = "requestedCPF";
        }
    } else if (user.cpf === null) {
        if (userStages[message.from] == undefined) {
            client.sendMessage(message.from, "Por gentiliza digite seu *CPF*.");

            userStages[message.from] = "requestedCPF";
        } else if (userStages[message.from] === "requestedCPF") {
            user.cpf = message.body.replace(/[^\d]+/g, "");

            if (user.cpf.length != 11) {
                client.sendMessage(
                    message.from,
                    "CPF inválido, por gentileza digite novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        cpf: user.cpf,
                    },
                });

                client.sendMessage(
                    message.from,
                    "Obrigado por informar seu CPF."
                );

                client.sendMessage(
                    message.from,
                    "Digite o número do serviço desejado:\n\n*1*. Serviço A\n*2*. Serviço B\n*3*. Serviço C\n*4*. Serviço D\n*5*. Serviço E"
                );

                userStages[message.from] = "requestedServiceNumber";
            }
        }
    } else if (userStages[message.from] == undefined) {
        client.sendMessage(
            message.from,
            "Digite o número de alguns dos nossos serviços disponíveis:\n\n*1*. Serviço A\n*2*. Serviço B\n*3*. Serviço C\n*4*. Serviço D\n*5*. Serviço E"
        );

        userStages[message.from] = "requestedServiceNumber";
    } else if (userStages[message.from] == "requestedServiceNumber") {
        const listNumbersService = ["1", "2", "3", "4", "5"];
        const chosenNumber = message.body;

        if (!listNumbersService.includes(chosenNumber)) {
            client.sendMessage(
                message.from,
                "Número inválido, por favor tente novamente."
            );
        } else {
            client.sendMessage(
                message.from,
                `Você escolheu o serviço de número ${chosenNumber}.`
            );

            client.sendMessage(
                message.from,
                "Aguarde alguns instantes que irei encaminha-lo para algum dos nossos atendentes, você será atendido em breve."
            );

            userStages[message.from] = "in_attendance";
        }
    }
}

client.initialize();
