"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactPhoneDto = void 0;
exports.parsePhoneNumbersInput = parsePhoneNumbersInput;
const class_validator_1 = require("class-validator");
class ContactPhoneDto {
    number;
    type;
    isPrimary;
}
exports.ContactPhoneDto = ContactPhoneDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Phone number is required' }),
    __metadata("design:type", String)
], ContactPhoneDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ContactPhoneDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], ContactPhoneDto.prototype, "isPrimary", void 0);
function parsePhoneNumbersInput(rawInput, fallbackSinglePhone) {
    let phones = [];
    if (typeof rawInput === 'string' && rawInput.trim().length > 0) {
        try {
            const parsed = JSON.parse(rawInput);
            if (Array.isArray(parsed)) {
                phones = parsed;
            }
        }
        catch {
            phones = rawInput
                .split(',')
                .map((p) => p.trim())
                .filter((p) => p.length > 0)
                .map((p, idx) => ({
                number: p,
                type: idx === 0 ? 'PRIMARY' : 'ALTERNATIVE',
                isPrimary: idx === 0,
            }));
        }
    }
    else if (Array.isArray(rawInput)) {
        phones = rawInput;
    }
    phones = phones
        .map((p) => ({
        number: String(p.number || '').trim(),
        type: p.type || 'PERSONAL',
        isPrimary: Boolean(p.isPrimary),
    }))
        .filter((p) => p.number.length > 0);
    if (phones.length === 0 && fallbackSinglePhone && fallbackSinglePhone.trim().length > 0) {
        phones = [
            {
                number: fallbackSinglePhone.trim(),
                type: 'PRIMARY',
                isPrimary: true,
            },
        ];
    }
    if (phones.length > 0) {
        const hasPrimary = phones.some((p) => p.isPrimary);
        if (!hasPrimary) {
            phones[0].isPrimary = true;
        }
    }
    return phones;
}
//# sourceMappingURL=contact-phone.dto.js.map