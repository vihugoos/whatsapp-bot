module.exports = function convertToTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());
};
