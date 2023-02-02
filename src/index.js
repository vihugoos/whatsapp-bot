const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const identifyUserByPhoneNumberController = require("./controllers/identifyUserByPhoneNumberController");
const flagsController = require("./controllers/flagsController");
const rejectCalls = require("./lib/rejectCalls");

const prisma = require("./database/prisma-client");

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ["--no-sandbox"],
        headless: true,
    },
});

client.initialize();

client.on("loading_screen", (percent) => {
    console.log(`\n[wpp-bot]: Loading screen... ${percent}% percent`);
});

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
    console.log("\n[wpp-bot]: Client is authenticated");
});

client.on("auth_failure", (msg) => {
    console.error("\n[wpp-bot]: Authentication failure:", msg);
});

client.on("ready", () => {
    console.log("\n[wpp-bot]: Client connected successfully");
});

client.on("message", async (message) => {
    identifyUserByPhoneNumberController(client, prisma, message);
});

client.on("message_create", async (message) => {
    flagsController(client, prisma, message);
});

client.on("group_join", (notification) => {
    console.log("\n[wpp-bot]: bot joined the group:", notification);
});

client.on("call", async (call) => {
    rejectCalls(client, call);
});

client.on("change_state", (state) => {
    console.log("\n[wpp-bot]: Changed state, new status connection:", state);
});

client.on("disconnected", (reason) => {
    console.log("\n[wpp-bot]: Client was logged out", reason);
});
