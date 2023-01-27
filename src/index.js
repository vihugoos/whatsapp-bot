const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const prisma = require("./database/prisma-client");
const convertToTitleCase = require("./utils/convertToTitleCase");

var userStage = [];

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
    console.log("\n[bot-wpp]: Client is authenticated.");
});

client.on("auth_failure", (msg) => {
    console.error("\n[bot-wpp]: Authentication Failure:", msg);
});

client.on("ready", () => {
    console.log("\n[bot-wpp]: Client connected successfully.");
});

client.on("disconnected", (reason) => {
    console.log("\n[bot-wpp]: Client was logged out.", reason);
});

client.on("message", async (message) => {
    console.log("\n[bot-wpp]: User stage:", userStage[message.from]);

    console.log(`[bot-wpp]: Message from ${message.from}:`, message.body);

    identifyUserByPhoneNumber(message);
});

client.on("message_create", (message) => {
    if (message.fromMe) {
        if (message.body.toLowerCase().includes("atendimento finalizado")) {
            userStage[message.to] = undefined;

            console.log(`\n[bot-wpp]: Attendance ended for ${message.to}`);
        }
    }
});

async function identifyUserByPhoneNumber(message) {
    if (message.from === "status@broadcast") return;

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

    console.log("[bot-wpp]: User ID:", user.id);

    checkUserStage(user, message);
}

async function checkUserStage(user, message) {
    const USER_WITHOUT_SESSION = undefined;
    const FIELD_NOT_REGISTERED = null;

    if (userStage[message.from] === USER_WITHOUT_SESSION) {
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

    if (user.name === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                "Verifiquei que esse número não está cadastrado em nosso sistema."
            );

            client.sendMessage(
                message.from,
                "Já possui um cadastro anterior? Digite *'sim'* ou *'não'*."
            );

            userStage[message.from] = "askedIfAlreadyRegistered";
        } else if (userStage[message.from] === "askedIfAlreadyRegistered") {
            let messageFromUser = message.body
                .replace(/[ìí]/gi, "i")
                .replace(/[ã]/gi, "a")
                .toLowerCase();

            if (messageFromUser === "sim") {
                client.sendMessage(
                    message.from,
                    "Apenas para confirmação, por gentiliza digite seu *cpf*."
                );

                userStage[message.from] =
                    "requestedCPFToConfirmPreviousRegistration";
            } else if (messageFromUser === "nao") {
                client.sendMessage(
                    message.from,
                    "Vamos dar prosseguimento no cadastro por aqui mesmo, irei apenas precisar de algumas informações."
                );

                client.sendMessage(
                    message.from,
                    "Digite seu *nome* completo por favor."
                );

                userStage[message.from] = "requestedFullName";
            } else {
                client.sendMessage(
                    message.from,
                    "Resposta inválida, tente novamente."
                );
            }
        } else if (
            userStage[message.from] ===
            "requestedCPFToConfirmPreviousRegistration"
        ) {
            user.cpf = message.body.replace(/[^\d]+/g, "");

            if (user.cpf.length != 11) {
                client.sendMessage(
                    message.from,
                    "CPF digitado incorretamente (não possui 11 dígitos), por gentileza digite novamente."
                );
            } else {
                previous_registration = await prisma.users.findFirst({
                    where: {
                        cpf: user.cpf,
                    },
                });

                if (!previous_registration) {
                    client.sendMessage(
                        message.from,
                        "Não encontrei esse CPF no nosso sistema."
                    );

                    client.sendMessage(
                        message.from,
                        "Será necessário realizar um novo cadastro. Irei precisar de algumas informações."
                    );

                    client.sendMessage(
                        message.from,
                        "Por gentileza digite seu *nome* completo."
                    );

                    userStage[message.from] = "requestedFullName";
                } else {
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
                            rg: previous_registration.rg,
                            email: previous_registration.email,
                            crm: previous_registration.crm,
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
                        "Você já está habilitado a requisitar nossos serviços novamente."
                    );

                    sendServiceOptions(message);

                    userStage[message.from] = "requestedServiceNumber";
                }
            }
        } else if (userStage[message.from] === "requestedFullName") {
            user.name = message.body.replace(/[^a-zA-Z ]/g, "");

            user.name = convertToTitleCase(user.name);

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

            client.sendMessage(message.from, "Digite seu *CPF*.");

            userStage[message.from] = "requestedCPF";
        }
    } else if (user.cpf === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                `${user.name}, vamos continuar com o seu cadastro.`
            );

            client.sendMessage(message.from, "Por gentiliza digite seu *CPF*.");

            userStage[message.from] = "requestedCPF";
        } else if (userStage[message.from] === "requestedCPF") {
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

                client.sendMessage(message.from, "Digite seu *RG*.");

                userStage[message.from] = "requestedRG";
            }
        }
    } else if (user.rg === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                `${user.name}, vamos continuar com o seu cadastro.`
            );

            client.sendMessage(message.from, "Por gentiliza digite seu *RG*.");

            userStage[message.from] = "requestedRG";
        } else if (userStage[message.from] === "requestedRG") {
            user.rg = message.body.replace(/[^\d]+/g, "");

            if (user.rg.length != 9) {
                client.sendMessage(
                    message.from,
                    "RG inválido, por gentileza digite novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        rg: user.rg,
                    },
                });

                client.sendMessage(message.from, "Digite seu *email*.");

                userStage[message.from] = "requestedEmail";
            }
        }
    } else if (user.email === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                `${user.name}, vamos continuar com o seu cadastro.`
            );

            client.sendMessage(
                message.from,
                "Por gentiliza digite seu *email*."
            );

            userStage[message.from] = "requestedEmail";
        } else if (userStage[message.from] === "requestedEmail") {
            const validateEmail = new RegExp(
                "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
            );

            user.email = message.body.toLowerCase();

            if (!validateEmail.test(user.email)) {
                client.sendMessage(
                    message.from,
                    "Email inválido, por gentileza digite novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        email: user.email,
                    },
                });

                client.sendMessage(
                    message.from,
                    "Digite seu *CRM* (apenas números)."
                );

                userStage[message.from] = "requestedCrm";
            }
        }
    } else if (user.crm === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                `${user.name}, vamos continuar com o seu cadastro.`
            );

            client.sendMessage(
                message.from,
                "Por gentiliza digite seu *CRM* (apenas números)."
            );

            userStage[message.from] = "requestedCrm";
        } else if (userStage[message.from] === "requestedCrm") {
            user.crm = message.body.replace(/[^\d]+/g, "");

            if (user.crm.length != 6) {
                client.sendMessage(
                    message.from,
                    "CRM inválido, por gentileza digite novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        crm: user.crm,
                    },
                });

                client.sendMessage(
                    message.from,
                    "Cadastro realizado com sucesso!"
                );

                client.sendMessage(
                    message.from,
                    "Você já está habilitado a requisitar nossos serviços."
                );

                sendServiceOptions(message);

                userStage[message.from] = "requestedServiceNumber";
            }
        }
    } else if (userStage[message.from] === USER_WITHOUT_SESSION) {
        // User already registered, requesting service number.
        sendServiceOptions(message);

        userStage[message.from] = "requestedServiceNumber";
    } else if (userStage[message.from] === "requestedServiceNumber") {
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

            userStage[message.from] = "in_attendance";
        }
    }
}

function sendServiceOptions(message) {
    client.sendMessage(
        message.from,
        "Digite o número do serviço desejado:\n\n*1*. Serviço A\n*2*. Serviço B\n*3*. Serviço C\n*4*. Serviço D\n*5*. Serviço E"
    );
}

client.initialize();
