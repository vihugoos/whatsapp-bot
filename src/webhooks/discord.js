require("dotenv").config();
const axios = require("axios");

module.exports = async function sendMessageToDiscordChannel({
    client_name,
    chosen_service,
    protocol,
    discord_user_id,
}) {
    const discord_core_role = "1067573586363162815";
    let message;

    if (discord_user_id) {
        message = `Solicitação atribuída para <@!${discord_user_id}>`;
    } else {
        message = `**AVISO:** Esta solicitação não foi atribuída a ninguém! <@&${discord_core_role}>`;
    }

    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        content: message,
        embeds: [
            {
                title: `Nova solicitação de ${client_name}`,
                description: `Serviço escolhido: **${chosen_service}**\nProtocolo de atendimento: **${protocol}**`,
                color: 4437377,
            },
        ],
    });
};
