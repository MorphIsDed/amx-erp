"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = __importStar(require("bcrypt"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var password, tenant, mockUsers, _i, mockUsers_1, u, warehouseMumbai, warehouseDelhi, vendor, products, _a, products_1, p, product;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, bcrypt.hash('admin123', 10)];
                case 1:
                    password = _b.sent();
                    return [4 /*yield*/, prisma.tenant.upsert({
                            where: { domain: 'amx-erp' },
                            update: {},
                            create: {
                                name: 'AMX Enterprise Solutions',
                                domain: 'amx-erp',
                            },
                        })];
                case 2:
                    tenant = _b.sent();
                    mockUsers = [
                        { email: 'admin@acme.com', name: 'Global Admin', role: client_1.Role.ADMIN },
                        { email: 'finance@acme.com', name: 'Finance Manager', role: client_1.Role.FINANCE },
                        { email: 'hr@acme.com', name: 'HR Manager', role: client_1.Role.HR },
                        { email: 'inventory@acme.com', name: 'Inventory Lead', role: client_1.Role.MANAGER },
                        { email: 'guest@acme.com', name: 'Executive Guest', role: client_1.Role.EMPLOYEE },
                        { email: 'admin@amx-erp.com', name: 'Admin User', role: client_1.Role.ADMIN }, // keep existing
                    ];
                    _i = 0, mockUsers_1 = mockUsers;
                    _b.label = 3;
                case 3:
                    if (!(_i < mockUsers_1.length)) return [3 /*break*/, 6];
                    u = mockUsers_1[_i];
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: u.email },
                            update: {},
                            create: {
                                email: u.email,
                                password: password,
                                name: u.name,
                                role: u.role,
                                tenantId: tenant.id,
                            },
                        })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, prisma.warehouse.create({
                        data: {
                            name: 'Main Hub — Mumbai',
                            location: 'Navi Mumbai',
                            isDefault: true,
                            tenantId: tenant.id,
                        },
                    })];
                case 7:
                    warehouseMumbai = _b.sent();
                    return [4 /*yield*/, prisma.warehouse.create({
                            data: {
                                name: 'North Depot — Delhi',
                                location: 'Gurugram',
                                tenantId: tenant.id,
                            },
                        })];
                case 8:
                    warehouseDelhi = _b.sent();
                    return [4 /*yield*/, prisma.vendor.create({
                            data: {
                                name: 'TechLogistics Ltd',
                                code: 'VEND-001',
                                email: 'sales@techlogistics.com',
                                tenantId: tenant.id,
                            },
                        })];
                case 9:
                    vendor = _b.sent();
                    products = [
                        { sku: 'LOG-MX3', name: 'Logitech MX Master 3', category: 'Peripherals', unit: 'pcs', price: 8500 },
                        { sku: 'MAC-M3P', name: 'MacBook Pro M3 14"', category: 'Laptops', unit: 'pcs', price: 185000 },
                        { sku: 'DEL-U27', name: 'Dell UltraSharp 27"', category: 'Monitors', unit: 'pcs', price: 42000 },
                        { sku: 'KEY-K2V', name: 'Keychron K2 V2', category: 'Peripherals', unit: 'pcs', price: 9500 },
                    ];
                    _a = 0, products_1 = products;
                    _b.label = 10;
                case 10:
                    if (!(_a < products_1.length)) return [3 /*break*/, 14];
                    p = products_1[_a];
                    return [4 /*yield*/, prisma.product.create({
                            data: __assign(__assign({}, p), { tenantId: tenant.id, vendorId: vendor.id }),
                        })];
                case 11:
                    product = _b.sent();
                    // Initial Stock Movement (Receipt)
                    return [4 /*yield*/, prisma.stockMovement.create({
                            data: {
                                productId: product.id,
                                warehouseId: warehouseMumbai.id,
                                type: client_1.StockMovementType.IN,
                                quantity: Math.floor(Math.random() * 100) + 10,
                                reason: 'Initial Inventory Setup',
                                tenantId: tenant.id,
                            },
                        })];
                case 12:
                    // Initial Stock Movement (Receipt)
                    _b.sent();
                    _b.label = 13;
                case 13:
                    _a++;
                    return [3 /*break*/, 10];
                case 14:
                    console.log('Seed completed successfully');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
