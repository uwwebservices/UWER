module.exports = {
    preset: "jest-puppeteer",
    globals: {
        URL: "localhost:1111"
    },
    testMatch: [
        "**/test/**/*.test.js"
    ],
    verbose: true
}