module.exports = function isOutsideBusinessHours() {
    const date = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    });

    const hourNow = Number(date.split(" ")[1].split(":")[0]);

    if (hourNow < 8 || hourNow >= 18) {
        console.log("\n[wpp-bot]: Outside business hours!");
        return true;
    } else {
        return false;
    }
};
