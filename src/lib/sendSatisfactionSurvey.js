const { Buttons } = require("whatsapp-web.js");

module.exports = function sendSatisfactionSurvey(client, message) {
    const satisfactionSurvey = new Buttons(
        "Ajude-nos a melhorar nossos serviços e atendimento respondendo à nossa pesquisa de satisfação. Sua colaboração é muito importante para nós.\nObrigado! 🩺✅",
        [{ body: "Ruim" }, { body: "Bom" }, { body: "Muito bom" }],
        "Pesquisa de Satisfação",
        "Liber Assessoria & Soluções"
    );

    client.sendMessage(message.to, satisfactionSurvey);

    console.log(`\n[wpp-bot]: Satisfaction survey sent to ${message.to}`);
};
