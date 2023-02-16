module.exports = async function askedIfAlreadyClientLiberStage(
    client,
    prisma,
    user,
    message
) {
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
};
