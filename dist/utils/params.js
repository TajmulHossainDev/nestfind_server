"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParam = getParam;
function getParam(req, name) {
    const value = req.params[name];
    return typeof value === "string" ? value : null;
}
