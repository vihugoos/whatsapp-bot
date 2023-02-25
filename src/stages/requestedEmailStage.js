const sendServiceOptions = require("../lib/sendServiceOptions");
const sleep = require("../utils/sleep");

module.exports = async function requestedEmailStage(
    client,
    prisma,
    user,
    message,
    chat
) {
    const validateEmail = new RegExp(
        "([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|\"([]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(.[!#-'*+/-9=?A-Z^-~-]+)*|[[\t -Z^-~]*])"
    );

    emailTypedByUser = message.body.toLowerCase();

    if (!validateEmail.test(emailTypedByUser)) {
        chat.sendStateTyping();

        await sleep(1500);

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
            chat.sendStateTyping();

            await sleep(1500);

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

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(message.from, "Cadastro realizado com sucesso!");

            await sleep(1000);

            chat.sendStateTyping();

            await sleep(1500);

            client.sendMessage(
                message.from,
                "Você já está habilitado(a) a requisitar nossos serviços."
            );

            await sleep(1000);

            await sendServiceOptions(client, message, chat);

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
