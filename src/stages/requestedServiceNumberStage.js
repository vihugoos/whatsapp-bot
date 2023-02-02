module.exports = async function requestedServiceNumberStage(
    client,
    prisma,
    user,
    message
) {
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
        const attendant = await prisma.attendants.findFirst({
            where: {
                in_attendance: false,
            },
        });

        const newSolicitation = await prisma.solicitations.create({
            data: {
                user_id: user.id,
                service: listServices[chosenNumber - 1],
                attendant_id: attendant ? attendant.id : null,
            },
        });

        if (attendant) {
            await prisma.attendants.update({
                where: {
                    id: attendant.id,
                },
                data: {
                    in_attendance: true,
                },
            });
        }

        console.log("\n[wpp-bot]: Solicitation created with successfully");
        console.log("[wpp-bot]: Solicitation ID:", newSolicitation.id);

        client.sendMessage(
            message.from,
            `Serviço número ${chosenNumber} selecionado.`
        );

        client.sendMessage(
            message.from,
            `Protocolo de atendimento: ${newSolicitation.id}`
        );

        client.sendMessage(
            message.from,
            "Enviarei sua solicitação para um de nossos atendentes. Aguarde um momento, você será atendido em breve."
        );

        client.sendMessage(
            message.from,
            "Se possível, por favor forneça mais detalhes sobre sua solicitação para que possamos avançar com o processo."
        );

        client.sendMessage(message.from, "Caso prefira, nos envie um áudio.");

        await prisma.users.update({
            where: {
                id: user.id,
            },
            data: {
                stage: "in_attendance",
            },
        });
    }
};
