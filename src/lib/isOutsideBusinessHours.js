module.exports = function isOutsideBusinessHours() {
    const hourNow = Number(
        new Date()
            .toLocaleString("pt-BR", {
                timeZone: "America/Sao_Paulo",
            })
            .split(" ")[1]
            .split(":")[0]
    );

    const dayWeek = Number(
        new Date().getDay().toLocaleString("pt-BR", {
            timeZone: "America/Sao_Paulo",
        })
    );

    if (dayWeek === 0 || dayWeek === 6) {
        console.log("\n[wpp-bot]: Weekend!");
        return true;
    } else if (hourNow < 8 || hourNow >= 18) {
        console.log("\n[wpp-bot]: Outside business hours!");
        return true;
    } else {
        return false;
    }
};
