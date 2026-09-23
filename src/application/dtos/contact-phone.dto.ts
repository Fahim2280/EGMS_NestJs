import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ContactPhone, PhoneType } from '../../domain/common/contact-phone.interface';

export class ContactPhoneDto implements ContactPhone {
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  number: string;

  @IsString()
  @IsOptional()
  type?: PhoneType | string;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export function parsePhoneNumbersInput(
  rawInput: any,
  fallbackSinglePhone?: string,
): ContactPhone[] {
  let phones: ContactPhone[] = [];

  if (typeof rawInput === 'string' && rawInput.trim().length > 0) {
    try {
      const parsed = JSON.parse(rawInput);
      if (Array.isArray(parsed)) {
        phones = parsed;
      }
    } catch {
      // If it's a comma-separated or plain string
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
  } else if (Array.isArray(rawInput)) {
    phones = rawInput;
  }

  // Filter out any entries with empty number
  phones = phones
    .map((p) => ({
      number: String(p.number || '').trim(),
      type: p.type || 'PERSONAL',
      isPrimary: Boolean(p.isPrimary),
    }))
    .filter((p) => p.number.length > 0);

  // If no phones were parsed from rawInput, fallback to single phone if provided
  if (phones.length === 0 && fallbackSinglePhone && fallbackSinglePhone.trim().length > 0) {
    phones = [
      {
        number: fallbackSinglePhone.trim(),
        type: 'PRIMARY',
        isPrimary: true,
      },
    ];
  }

  // Ensure at least one is designated as isPrimary
  if (phones.length > 0) {
    const hasPrimary = phones.some((p) => p.isPrimary);
    if (!hasPrimary) {
      phones[0].isPrimary = true;
    }
  }

  return phones;
}
