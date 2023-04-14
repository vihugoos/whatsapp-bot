const capturedSatisfactionSurvey = require("../lib/capturedSatisfactionSurvey");
const userAlreadyRegisteredWithoutSessionStage = require("../stages/userAlreadyRegisteredWithoutSessionStage");
const userWithoutRegistrationWithoutSessionStage = require("../stages/userWithoutRegistrationWithoutSessionStage");
const askedIfAlreadyClientLiberStage = require("../stages/askedIfAlreadyClientLiberStage");
const requestedCPFToConfirmPreviousRegistrationStage = require("../stages/requestedCPFToConfirmPreviousRegistrationStage");
const requestedFullNameStage = require("../stages/requestedFullNameStage");
const requestedCPFStage = require("../stages/requestedCPFStage");
const requestedRGStage = require("../stages/requestedRGStage");
const requestedEmailStage = require("../stages/requestedEmailStage");
const requestedServiceNumberStage = require("../stages/requestedServiceNumberStage");

module.exports = async function userStageController(
    client,
    prisma,
    user,
    message,
    chat
) {
    const USER_WITHOUT_SESSION = null;
    const USER_WITHOUT_REGISTRATION = !user.cpf ? true : false;
    const USER_HAS_REGISTRATION = user.cpf;

    if (USER_HAS_REGISTRATION) {
        if (user.stage === USER_WITHOUT_SESSION) {
            if (
                await capturedSatisfactionSurvey(
                    client,
                    prisma,
                    user,
                    message,
                    chat
                )
            ) {
                return;
            }

            await userAlreadyRegisteredWithoutSessionStage(
                client,
                prisma,
                user,
                message,
                chat
            );
        }
    }

    if (USER_WITHOUT_REGISTRATION) {
        if (user.stage === USER_WITHOUT_SESSION) {
            await userWithoutRegistrationWithoutSessionStage(
                client,
                prisma,
                user,
                message,
                chat
            );
        }

        if (user.stage === "askedIfAlreadyClientLiber") {
            await askedIfAlreadyClientLiberStage(
                client,
                prisma,
                user,
                message,
                chat
            );
        }

        if (user.stage === "requestedCPFToConfirmPreviousRegistration") {
            await requestedCPFToConfirmPreviousRegistrationStage(
                client,
                prisma,
                user,
                message,
                chat
            );
        }
    }

    if (user.stage === "requestedFullName") {
        await requestedFullNameStage(client, prisma, user, message, chat);
    }

    if (user.stage === "requestedCPF") {
        await requestedCPFStage(client, prisma, user, message, chat);
    }

    if (user.stage === "requestedRG") {
        await requestedRGStage(client, prisma, user, message, chat);
    }

    if (user.stage === "requestedEmail") {
        await requestedEmailStage(client, prisma, user, message, chat);
    }

    if (user.stage === "requestedServiceNumber") {
        await requestedServiceNumberStage(client, prisma, user, message, chat);
    }
};
