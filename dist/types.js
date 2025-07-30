"use strict";
/**
 * Core types and interfaces for the Drips Raffle SDK
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkError = exports.InsufficientFundsError = exports.InvalidRaffleStateError = exports.RaffleNotFoundError = exports.DripsSDKError = exports.RaffleEventType = void 0;
var RaffleEventType;
(function (RaffleEventType) {
    RaffleEventType["RAFFLE_CREATED"] = "RaffleCreated";
    RaffleEventType["PARTICIPANT_JOINED"] = "ParticipantJoined";
    RaffleEventType["WINNER_SELECTED"] = "WinnerSelected";
    RaffleEventType["RAFFLE_PAUSED"] = "RafflePaused";
    RaffleEventType["RAFFLE_UNPAUSED"] = "RaffleUnpaused";
})(RaffleEventType || (exports.RaffleEventType = RaffleEventType = {}));
// Error types
class DripsSDKError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
        this.name = 'DripsSDKError';
    }
}
exports.DripsSDKError = DripsSDKError;
class RaffleNotFoundError extends DripsSDKError {
    constructor(raffleId) {
        super(`Raffle not found: ${raffleId}`, 'RAFFLE_NOT_FOUND');
    }
}
exports.RaffleNotFoundError = RaffleNotFoundError;
class InvalidRaffleStateError extends DripsSDKError {
    constructor(message) {
        super(message, 'INVALID_RAFFLE_STATE');
    }
}
exports.InvalidRaffleStateError = InvalidRaffleStateError;
class InsufficientFundsError extends DripsSDKError {
    constructor(required, available) {
        super(`Insufficient funds: required ${required}, available ${available}`, 'INSUFFICIENT_FUNDS');
    }
}
exports.InsufficientFundsError = InsufficientFundsError;
class NetworkError extends DripsSDKError {
    constructor(message) {
        super(`Network error: ${message}`, 'NETWORK_ERROR');
    }
}
exports.NetworkError = NetworkError;
//# sourceMappingURL=types.js.map