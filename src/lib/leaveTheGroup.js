module.exports = async function leaveTheGroup(notification) {
    console.log("\n[wpp-bot]: bot joined the group:", notification.chatId);

    let chat = await notification.getChat();

    if (chat.isGroup) {
        console.log("[wpp-bot]: leaving the group...");
        chat.leave();
    }
};
