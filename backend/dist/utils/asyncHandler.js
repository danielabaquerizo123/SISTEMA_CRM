"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
function asyncHandler(controller) {
    return (req, res, next) => {
        controller(req, res, next).catch(next);
    };
}
