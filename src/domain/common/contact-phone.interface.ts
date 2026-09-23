export type PhoneType = 'PRIMARY' | 'PERSONAL' | 'WHATSAPP' | 'EMERGENCY' | 'WORK' | 'ALTERNATIVE';

export interface ContactPhone {
  number: string;
  type?: PhoneType | string;
  isPrimary?: boolean;
}
