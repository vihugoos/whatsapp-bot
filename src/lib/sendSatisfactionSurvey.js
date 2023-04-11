const { Buttons } = require("whatsapp-web.js");
const sleep = require("../utils/sleep");

module.exports = async function sendSatisfactionSurvey(client, message, chat) {
    chat.sendStateTyping();

    await sleep(1500);

    // const satisfactionSurvey = new Buttons(
    //     "Ajude-nos a melhorar nossos serviços e atendimento respondendo à nossa pesquisa de satisfação. Sua colaboração é muito importante para nós. Obrigado! 🩺✅",
    //     [{ body: "Ruim" }, { body: "Bom" }, { body: "Muito bom" }],
    //     "Pesquisa de Satisfação",
    //     "Liber Assessoria & Soluções"
    // );

    // client.sendMessage(message.to, satisfactionSurvey);

    client.sendMessage(
        message.to,
        "Ajude-nos a melhorar nossos serviços e atendimento respondendo à nossa pesquisa de satisfação. Sua colaboração é muito importante para nós. Obrigado! 🩺✅\n\n*1*. Ruim\n*2*. Bom\n*3*. Muito bom"
    );

    console.log(`\n[wpp-bot]: Satisfaction survey sent to ${message.to}`);
};
