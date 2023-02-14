const sendServiceOptions = require("../lib/sendServiceOptions");

module.exports = async function requestedEmailStage(
    client,
    prisma,
    user,
    message
) {
    const validateEmail = new RegExp(
        "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
    );

    emailTypedByUser = message.body.toLowerCase();

    if (!validateEmail.test(emailTypedByUser)) {
        await client.sendMessage(
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
            await client.sendMessage(
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

            await client.sendMessage(
                message.from,
                "Cadastro realizado com sucesso!"
            );

            await client.sendMessage(
                message.from,
                "Você já está habilitado a requisitar nossos serviços."
            );

            await sendServiceOptions(client, message);

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
};
