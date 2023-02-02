const { Buttons } = require("whatsapp-web.js");

const convertToTitleCase = require("../utils/convertToTitleCase");
const sendServiceOptions = require("../lib/sendServiceOptions");

module.exports = async function userStageController(
    client,
    prisma,
    user,
    message
) {
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
};
