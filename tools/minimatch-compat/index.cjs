// Only the callable + named APIs used by existing ESLint consumers are adapted.
// Matching and preprocessing remain exclusively in the patched upstream engine.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- Legacy callers synchronously require a CommonJS function.
const modern = require("minimatch");
const legacy = (...args) => modern.minimatch(...args);
module.exports = Object.assign(legacy, modern);
