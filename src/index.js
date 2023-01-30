const { Client, LocalAuth, Buttons } = require("whatsapp-web.js");
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
    identifyUserByPhoneNumber(message);
});

client.on("message_create", async (message) => {
    if (message.fromMe) {
        if (message.body.toLowerCase().includes("atendimento finalizado")) {
            const solicitationId = userStage[message.to];

            const solicitationClosed = await prisma.solicitations.update({
                where: {
                    id: solicitationId,
                },
                data: {
                    open: false,
                    end_at: new Date(),
                },
            });

            console.log("\n[wpp-bot]: Solicitation closed");
            console.log("[wpp-bot]: Solicitation ID:", solicitationClosed.id);

            userStage[message.to] = undefined;

            console.log(`\n[wpp-bot]: Attendance ended for ${message.to}`);

            const satisfactionSurvey = new Buttons(
                "Por gentileza nos dê um feedback sobre nossos serviços. É importante você ser realmente sincero para que possamos sempre estarmos melhorando. Obrigado!",
                [{ body: "Ruim" }, { body: "Mediano" }, { body: "Muito bom" }],
                "Pesquisa de Satisfação",
                "Liber Assessoria & Soluções"
            );

            client.sendMessage(message.to, satisfactionSurvey);

            console.log(
                `\n[wpp-bot]: Satisfaction survey sent to ${message.to}`
            );
        }

        if (
            message.body
                .toLowerCase()
                .includes("prosseguimento no seu cadastro")
        ) {
            userStage[message.to] = "requestedFullName";

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

client.on("message_revoke_everyone", async (before) => {
    if (before) {
        if (before.from === "status@broadcast") return;

        console.log("\n[wpp-bot]: Message deleted:", {
            fromMe: before.fromMe,
            from: before.from,
            notifyName: before.notifyName,
            author: before.author,
            type: before.type,
            body: before.body,
            isStatus: before.isStatus,
        });
    }
});

client.on("group_join", (notification) => {
    console.log("\n[wpp-bot]: bot joined the group:", notification);
});

client.on("call", async (call) => {
    let rejectCalls = true;

    console.log("\n[wpp-bot]: Call received, rejecting:", call);

    if (rejectCalls) await call.reject();

    await client.sendMessage(
        call.from,
        "Ops, nós não aceitamos calls por essa conta!"
    );

    await client.sendMessage(
        call.from,
        "Todo nosso contato é feito apenas via chat."
    );
});

client.on("change_state", (state) => {
    console.log("\n[wpp-bot]: Changed state, new status connection:", state);
});

client.on("disconnected", (reason) => {
    console.log("\n[wpp-bot]: Client was logged out", reason);
});

async function identifyUserByPhoneNumber(message) {
    if (message.from === "status@broadcast") return;

    console.log("\n[wpp-bot]: User stage:", userStage[message.from]);

    console.log(`[wpp-bot]: Message from ${message.from}:`, message.body);

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

    console.log("[wpp-bot]: User ID:", user.id);

    checkUserStage(user, message);
}

async function checkUserStage(user, message) {
    const USER_WITHOUT_SESSION = undefined;
    const FIELD_NOT_REGISTERED = null;

    if (userStage[message.from] === USER_WITHOUT_SESSION) {
        // Verify if user answered satisfaction survey
        if (message.hasQuotedMsg) {
            switch (message.body) {
                case "Ruim":
                    console.log(
                        `\n[wpp-bot]: Satisfaction survey, ${
                            user.name.split(" ")[0]
                        } answered 'ruim'`
                    );
                    return;
                case "Mediano":
                    console.log(
                        `\n[wpp-bot]: Satisfaction survey, ${
                            user.name.split(" ")[0]
                        } answered 'mediano'`
                    );
                    return;
                case "Muito bom":
                    console.log(
                        `\n[wpp-bot]: Satisfaction survey, ${
                            user.name.split(" ")[0]
                        } answered 'muito bom'`
                    );
                    return;
                default:
                    console.log(
                        "\n[wpp-bot]: Satisfaction survey, response not found!"
                    );
            }
        }

        if (user.name) {
            client.sendMessage(
                message.from,
                `Olá ${
                    user.name.split(" ")[0]
                }, tudo bem? Sou a assistente virtual da Liber, estou aqui para agilizar no seu atendimento. 🌎`
            );
        } else {
            client.sendMessage(
                message.from,
                "Olá, tudo bem? Sou a assistente virtual da Liber, estou aqui para agilizar no seu atendimento. 🌎"
            );
        }
    }

    if (user.name === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                "Verifiquei que esse número não está cadastrado em nosso sistema."
            );

            const buttons = new Buttons(
                "Selecione uma das opções abaixo.",
                [{ body: "Já sou cliente Liber" }, { body: "Não sou cliente" }],
                "Pré-atendimento Automático",
                "Liber Assessoria & Soluções"
            );

            client.sendMessage(message.from, buttons);

            userStage[message.from] = "askedIfAlreadyClientLiber";
        } else if (userStage[message.from] === "askedIfAlreadyClientLiber") {
            if (message.body === "Já sou cliente Liber") {
                client.sendMessage(
                    message.from,
                    "Apenas para confirmação, por gentiliza digite seu *cpf*."
                );

                userStage[message.from] =
                    "requestedCPFToConfirmPreviousRegistration";
            } else if (message.body === "Não sou cliente") {
                client.sendMessage(
                    message.from,
                    "Aguarde alguns instantes por favor, que irei encaminhá-lo(a) para o nosso representante comercial."
                );

                userStage[message.from] = "in_attendance";
            } else {
                client.sendMessage(
                    message.from,
                    "Resposta inválida, por gentileza selecione uma das opções acima."
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
                        "Por favor, aguarde alguns instantes que irei encaminha-lo a um de nossos atendentes para melhor análise do caso."
                    );

                    userStage[message.from] = "in_attendance";
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

                client.sendMessage(message.from, "Digite seu *CRM*.");

                userStage[message.from] = "requestedCrm";
            }
        }
    } else if (user.crm === FIELD_NOT_REGISTERED) {
        if (userStage[message.from] === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                `${user.name}, vamos continuar com o seu cadastro.`
            );

            client.sendMessage(message.from, "Por gentiliza digite seu *CRM*.");

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
        const listServices = [
            "Veículo",
            "Casa",
            "Atualizações",
            "Viagens",
            "Cancelamentos e Assinaturas",
            "Agendamentos",
        ];
        const numbersService = ["1", "2", "3", "4", "5", "6"];
        const chosenNumber = message.body;

        if (!numbersService.includes(chosenNumber)) {
            client.sendMessage(
                message.from,
                "Número inválido, por favor tente novamente."
            );
        } else {
            const newSolicitation = await prisma.solicitations.create({
                data: {
                    user_id: user.id,
                    servico: listServices[chosenNumber - 1],
                },
            });

            console.log("\n[wpp-bot]: Solicitation created with successfully");
            console.log("[wpp-bot]: Solicitation ID:", newSolicitation.id);

            client.sendMessage(
                message.from,
                `Serviço número ${chosenNumber} selecionado.`
            );

            client.sendMessage(
                message.from,
                "Aguarde alguns instantes que irei encaminhar para algum de nossos atendentes, você será atendido em breve."
            );

            client.sendMessage(
                message.from,
                "Caso seja possível, já pode ir nos adiantando com mais detalhes sua requisição."
            );

            client.sendMessage(
                message.from,
                "Fique a vontade também para enviar um áudio caso preferir."
            );

            userStage[message.from] = newSolicitation.id;
        }
    }
}

function sendServiceOptions(message) {
    client.sendMessage(
        message.from,
        "Digite o número do serviço desejado:\n\n*1*. Veículo\n*2*. Casa\n*3*. Atualizações\n*4*. Viagens\n*5*. Cancelamentos & Assinaturas\n*6*. Agendamentos"
    );
}
