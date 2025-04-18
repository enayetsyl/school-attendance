"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = ({ res, statusCode = 200, success = true, message, data, meta, }) => {
    const payload = { success };
    if (message)
        payload.message = message;
    if (data !== undefined)
        payload.data = data;
    if (meta)
        payload.meta = meta;
    return res.status(statusCode).json(payload);
};
exports.sendResponse = sendResponse;
