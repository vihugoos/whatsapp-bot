const { Client, LocalAuth, Buttons } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const prisma = require("./database/prisma-client");
const convertToTitleCase = require("./utils/convertToTitleCase");
const sendServiceOptions = require("./lib/sendServiceOptions");

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
    console.log(`[wpp-bot]: Message from ${user.phone_number}:`, message.body);
    console.log("[wpp-bot]: User ID:", user.id);

    checkUserStage(user, message);
}

async function checkUserStage(user, message) {
    const USER_WITHOUT_SESSION = null;
    const USER_WITHOUT_REGISTRATION = !user.email ? true : false;
    const USER_REGISTERED = user.email;

    if (USER_REGISTERED) {
        if (user.stage === USER_WITHOUT_SESSION) {
            // Verify if user answered satisfaction survey
            if (message.hasQuotedMsg) {
                let answer;

                switch (message.body) {
                    case "Muito bom":
                        console.log(
                            `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                                user.name.split(" ")[0]
                            } answered 'muito bom'`
                        );

                        answer = await prisma.surveys.create({
                            data: {
                                user_id: user.id,
                                answer: "muito bom",
                            },
                        });

                        console.log("[bot-wpp]: Survey ID:", answer.id);

                        return;
                    case "Bom":
                        console.log(
                            `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                                user.name.split(" ")[0]
                            } answered 'bom'`
                        );

                        answer = await prisma.surveys.create({
                            data: {
                                user_id: user.id,
                                answer: "bom",
                            },
                        });

                        console.log("[bot-wpp]: Survey ID:", answer.id);

                        return;
                    case "Ruim":
                        console.log(
                            `\n[wpp-bot]: Satisfaction survey, Dr(a) ${
                                user.name.split(" ")[0]
                            } answered 'ruim'`
                        );

                        answer = await prisma.surveys.create({
                            data: {
                                user_id: user.id,
                                answer: "ruim",
                            },
                        });

                        console.log("[bot-wpp]: Survey ID:", answer.id);

                        return;
                    default:
                        console.log(
                            "\n[wpp-bot]: Satisfaction survey, answer not found!"
                        );
                }
            }

            client.sendMessage(
                message.from,
                `Olá Dr(a) ${
                    user.name.split(" ")[0]
                }, eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻`
            );

            sendServiceOptions(client, message);

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: "requestedServiceNumber",
                },
            });
        }
    }

    if (USER_WITHOUT_REGISTRATION) {
        if (user.stage === USER_WITHOUT_SESSION) {
            client.sendMessage(
                message.from,
                "Olá! Eu sou a assistente virtual da Liber, pronta para agilizar seu atendimento e torná-lo ainda mais eficiente. Como posso ajudá-lo(a) hoje? 🩺✅👩🏻‍💻"
            );

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

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: "askedIfAlreadyClientLiber",
                },
            });
        }

        if (user.stage === "askedIfAlreadyClientLiber") {
            if (message.body === "Já sou cliente Liber") {
                client.sendMessage(
                    message.from,
                    "Por favor, informe seu *CPF* para confirmação."
                );

                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        stage: "requestedCPFToConfirmPreviousRegistration",
                    },
                });
            } else if (message.body === "Não sou cliente") {
                client.sendMessage(
                    message.from,
                    "Por favor, aguarde alguns instantes enquanto nosso representante comercial entra em contato."
                );

                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        stage: "in_attendance",
                    },
                });
            } else {
                client.sendMessage(
                    message.from,
                    "Resposta inválida, por gentileza selecione uma das opções acima."
                );
            }
        }

        if (user.stage === "requestedCPFToConfirmPreviousRegistration") {
            let cpfToConfirmTypedByUser = message.body.replace(/[^\d]+/g, "");

            if (cpfToConfirmTypedByUser.length != 11) {
                client.sendMessage(
                    message.from,
                    "CPF digitado incorretamente (não possui 11 dígitos), por gentileza digite novamente."
                );
            } else {
                previous_registration = await prisma.users.findFirst({
                    where: {
                        cpf: cpfToConfirmTypedByUser,
                    },
                });

                if (!previous_registration) {
                    client.sendMessage(
                        message.from,
                        "*CPF* não encontrado em nossa base de dados."
                    );

                    client.sendMessage(
                        message.from,
                        "Por favor, aguarde alguns instantes que irei encaminha-lo a um de nossos atendentes para melhor análise do caso."
                    );

                    await prisma.users.update({
                        where: {
                            id: user.id,
                        },
                        data: {
                            stage: "in_attendance",
                        },
                    });
                } else {
                    await prisma.users.delete({
                        where: {
                            id: user.id,
                        },
                    });

                    userUpdated = await prisma.users.update({
                        where: {
                            cpf: cpfToConfirmTypedByUser,
                        },
                        data: {
                            phone_number: user.phone_number,
                        },
                    });

                    client.sendMessage(
                        message.from,
                        `Dr(a) ${
                            userUpdated.name.split(" ")[0]
                        }, seu novo número de celular foi atualizado com sucesso!`
                    );

                    client.sendMessage(
                        message.from,
                        "Você já está habilitado a requisitar nossos serviços novamente."
                    );

                    sendServiceOptions(client, message);

                    await prisma.users.update({
                        where: {
                            id: userUpdated.id,
                        },
                        data: {
                            stage: "requestedServiceNumber",
                        },
                    });
                }
            }
        }
    }

    if (user.stage === "requestedFullName") {
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

        client.sendMessage(message.from, "Digite seu *CPF*.");

        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                stage: "requestedCPF",
            },
        });
    }

    if (user.stage === "requestedCPF") {
        let cpfTypedByUser = message.body.replace(/[^\d]+/g, "");

        if (cpfTypedByUser.length != 11) {
            client.sendMessage(
                message.from,
                "CPF inválido (não possui 11 dígitos), por gentileza digite novamente."
            );
        } else {
            const CPFAlreadyExists = await prisma.users.findFirst({
                where: {
                    cpf: cpfTypedByUser,
                },
            });

            if (CPFAlreadyExists) {
                client.sendMessage(
                    message.from,
                    "Esse CPF já existe em nosso sistema, por favor, tente novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        cpf: cpfTypedByUser,
                    },
                });

                client.sendMessage(message.from, "Digite seu *RG*.");

                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        stage: "requestedRG",
                    },
                });
            }
        }
    }

    if (user.stage === "requestedRG") {
        rgTypedByUser = message.body.replace(/[^\d]+/g, "");

        if (rgTypedByUser.length != 9) {
            client.sendMessage(
                message.from,
                "RG inválido (não possui 9 dígitos), por gentileza digite novamente."
            );
        } else {
            const RGAlreadyExists = await prisma.users.findFirst({
                where: {
                    rg: rgTypedByUser,
                },
            });

            if (RGAlreadyExists) {
                client.sendMessage(
                    message.from,
                    "Esse RG já existe em nosso sistema, por favor, tente novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        rg: rgTypedByUser,
                    },
                });

                client.sendMessage(message.from, "Digite seu *E-mail*.");

                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        stage: "requestedEmail",
                    },
                });
            }
        }
    }

    if (user.stage === "requestedEmail") {
        const validateEmail = new RegExp(
            "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
        );

        emailTypedByUser = message.body.toLowerCase();

        if (!validateEmail.test(emailTypedByUser)) {
            client.sendMessage(
                message.from,
                "E-mail inválido, por gentileza digite novamente."
            );
        } else {
            const emailAlreadyExists = await prisma.users.findFirst({
                where: {
                    email: emailTypedByUser,
                },
            });

            if (emailAlreadyExists) {
                client.sendMessage(
                    message.from,
                    "Esse e-mail já existe em nosso sistema, por favor, tente novamente."
                );
            } else {
                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        email: emailTypedByUser,
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

                sendServiceOptions(client, message);

                await prisma.users.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        stage: "requestedServiceNumber",
                    },
                });
            }
        }
    }

    if (user.stage === "requestedServiceNumber") {
        const listServices = [
            "Veículo",
            "Casa",
            "Atualizações",
            "Viagens",
            "Cancelamentos e Assinaturas",
            "Agendamentos",
            "Outros",
        ];
        const numbersService = ["1", "2", "3", "4", "5", "6", "7"];
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
                    service: listServices[chosenNumber - 1],
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
                "Enviarei sua solicitação para um de nossos atendentes. Aguarde um momento, você será atendido em breve."
            );

            client.sendMessage(
                message.from,
                "Se possível, por favor forneça mais detalhes sobre sua solicitação para que possamos avançar com o processo."
            );

            client.sendMessage(
                message.from,
                "Caso prefira, nos envie um áudio."
            );

            await prisma.users.update({
                where: {
                    id: user.id,
                },
                data: {
                    stage: "in_attendance",
                },
            });
        }
    }
}
