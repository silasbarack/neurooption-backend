"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRealMoneyAuthorization = requireRealMoneyAuthorization;
exports.assertDemoOnlyAccount = assertDemoOnlyAccount;
const common_1 = require("@nestjs/common");
function requireRealMoneyAuthorization() {
    throw new common_1.ServiceUnavailableException('Real-money transactions are not available.');
}
function assertDemoOnlyAccount(accountType) {
    if (accountType === 'QT Real')
        requireRealMoneyAuthorization();
}
//# sourceMappingURL=real-money-mode.js.map