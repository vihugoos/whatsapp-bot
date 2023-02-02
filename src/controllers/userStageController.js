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
    message
) {
    const USER_WITHOUT_SESSION = null;
    const USER_WITHOUT_REGISTRATION = !user.cpf ? true : false;
    const USER_HAS_REGISTRATION = user.cpf;

    if (USER_HAS_REGISTRATION) {
        if (user.stage === USER_WITHOUT_SESSION) {
            if (await capturedSatisfactionSurvey(prisma, user, message)) return;

            userAlreadyRegisteredWithoutSessionStage(
                client,
                prisma,
                user,
                message
            );
        }
    }

    if (USER_WITHOUT_REGISTRATION) {
        if (user.stage === USER_WITHOUT_SESSION) {
            userWithoutRegistrationWithoutSessionStage(
                client,
                prisma,
                user,
                message
            );
        }

        if (user.stage === "askedIfAlreadyClientLiber") {
            askedIfAlreadyClientLiberStage(client, prisma, user, message);
        }

        if (user.stage === "requestedCPFToConfirmPreviousRegistration") {
            requestedCPFToConfirmPreviousRegistrationStage(
                client,
                prisma,
                user,
                message
            );
        }
    }

    if (user.stage === "requestedFullName") {
        requestedFullNameStage(client, prisma, user, message);
    }

    if (user.stage === "requestedCPF") {
        requestedCPFStage(client, prisma, user, message);
    }

    if (user.stage === "requestedRG") {
        requestedRGStage(client, prisma, user, message);
    }

    if (user.stage === "requestedEmail") {
        requestedEmailStage(client, prisma, user, message);
    }

    if (user.stage === "requestedServiceNumber") {
        requestedServiceNumberStage(client, prisma, user, message);
    }
};
