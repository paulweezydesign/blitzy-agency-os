"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantContextService = void 0;
const common_1 = require("@nestjs/common");
const context_1 = require("@agencyos/context");
let TenantContextService = class TenantContextService {
    store = new context_1.TenantContextStore();
    run(context, callback) {
        return this.store.run(context, callback);
    }
    get() {
        return this.store.get();
    }
    setTenant(tenantId) {
        this.store.setTenant(tenantId);
    }
    setUser(userId, roles) {
        this.store.setUser(userId, roles);
    }
    merge(partial) {
        this.store.merge(partial);
    }
};
exports.TenantContextService = TenantContextService;
exports.TenantContextService = TenantContextService = __decorate([
    (0, common_1.Injectable)()
], TenantContextService);
//# sourceMappingURL=tenant-context.service.js.map