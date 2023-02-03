require("dotenv").config();
const axios = require("axios");

async function sendMessageToDiscordChannel({ from, type, protocol }) {
    await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        embeds: [
            {
                title: `Nova solicitação de ${from} (${type})`,
                description: `Assigned to <@!655259186111709217>, protocol: ${protocol}`,
                color: 4437377,
            },
        ],
    });
}

sendMessageToDiscordChannel({
    from: "Claudio",
    type: "Agendamentos",
    protocol: "eeaee3e8-e3cd-4242-ab08-e9d744680850",
});
