const sleep = require("../utils/sleep");

module.exports = async function rejectCalls(client, call) {
    let rejectCalls = true;

    console.log("\n[wpp-bot]: Call received, rejecting:", call);

    if (rejectCalls) await call.reject();

    client.sendMessage(
        call.from,
        "Ops, nós não aceitamos calls por essa conta!"
    );

    await sleep(1000);

    client.sendMessage(
        call.from,
        "Todo nosso contato é feito apenas via chat."
    );
};
