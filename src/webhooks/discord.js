require("dotenv").config();

const axios = require("axios");
const discord_core_role = "1067573586363162815";

async function sendNewSolicitationToDiscordChannel({
    client_name,
    phone_number,
    chosen_service,
    protocol,
    discord_user_id,
}) {
    let message;

    if (discord_user_id) {
        message = `Solicitação atribuída para <@!${discord_user_id}>`;
    } else {
        message = `**AVISO:** Esta solicitação não foi atribuída a ninguém! <@&${discord_core_role}>`;
    }

    await axios.post(process.env.DISCORD_WEBHOOK_URL_OPEN_SOLICITATIONS, {
        content: message,
        embeds: [
            {
                title: `Nova solicitação de ${client_name}`,
                description: `Celular: **${phone_number}**ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤﾠ\nServiço escolhido: **${chosen_service}**\nProtocolo: **${protocol}**`,
                color: 4437377,
            },
        ],
    });
}

async function sendSolicitationClosedToDiscordChannel(protocol) {
    await axios.post(process.env.DISCORD_WEBHOOK_URL_CLOSED_SOLICITATIONS, {
        embeds: [
            {
                title: `Protocolo: ${protocol}`,
                description:
                    "✅ﾠSolicitação fechada com sucesso!ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ",
                color: 7506394,
            },
        ],
    });
}

async function sendNewNonCustomerContactToDiscordChannel(
    user_id,
    phone_number
) {
    let message = `Novo contato de um Não-Cliente! <@&${discord_core_role}>`;

    await axios.post(process.env.DISCORD_WEBHOOK_URL_NON_CUSTOMERS, {
        content: message,
        embeds: [
            {
                title: `Novo contato de ${phone_number}`,
                description: `Status: **Em Atendimento**ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ\nID: **${user_id}**`,
                color: 16426522,
            },
        ],
    });
}

module.exports = {
    sendNewSolicitationToDiscordChannel,
    sendSolicitationClosedToDiscordChannel,
    sendNewNonCustomerContactToDiscordChannel,
};
