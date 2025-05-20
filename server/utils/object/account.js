const { ROLES } = require("../const");
const { validateEmail } = require("../helper");

function validateImportAccounts(accounts, role) {
    const errors = [];
    for (const account of accounts) {
        const errors = validateCreateFields(account, role);
        if (errors.length > 0) {
            return errors;
        }
    }
    return errors;
}

function validateCreateFields(account, role) {
    const errors = [];
    if (!account.full_name) {
        errors.push("Full name is required");
    }
    if (!account.username) {
        errors.push("Username is required");
    }
    if (!account.password) {
        errors.push("Password is required");
    }
    if (!account.msnv) {
        errors.push("MSNV is required");
    }

    if (!account.email) {
        errors.push("Email is required");
    }
    const emailError = validateEmail(account.email);
    if (!emailError) {
        errors.push("Email is invalid");
    }

    return errors;
}

function validateUpdateFields(account) {
    const errors = [];
    if (account.email != null) {
        const emailError = validateEmail(account.email);
        if (!emailError) {
            errors.push("Email is invalid");
        }
    }
    return errors;
}

module.exports = {
    validateImportAccounts,
    validateCreateFields,
    validateUpdateFields
};



