require("dotenv").config();

const axios = require("axios");
const discord_core_role = "1067573586363162815";

async function sendNewSolicitationToDiscordChannel({
    client_name,
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
                description: `Serviço escolhido: **${chosen_service}**\nProtocolo de atendimento: **${protocol}**`,
                color: 4437377,
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
                description: `Status: **Em Atendimento**\nID: **${user_id}**`,
                color: 7506394,
            },
        ],
    });
}

module.exports = {
    sendNewSolicitationToDiscordChannel,
    sendNewNonCustomerContactToDiscordChannel,
};
