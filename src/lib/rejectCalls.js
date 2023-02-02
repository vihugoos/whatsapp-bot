module.exports = async function rejectCalls(client, call) {
    let rejectCalls = true;

    console.log("\n[wpp-bot]: Call received, rejecting:", call);

    if (rejectCalls) await call.reject();

    await client.sendMessage(
        call.from,
        "Ops, nós não aceitamos calls por essa conta!"
    );

    await client.sendMessage(
        call.from,
        "Todo nosso contato é feito apenas via chat."
    );
};
