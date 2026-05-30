import * as crypto from 'crypto';

export class TotpUtil {
  private static base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  // Generate a random Base32 secret (160 bits = 20 bytes => 32 characters)
  static generateSecret(length = 32): string {
    const bytes = crypto.randomBytes((length * 5) / 8);
    let secret = '';
    let bin = '';
    for (let i = 0; i < bytes.length; i++) {
      bin += bytes[i].toString(2).padStart(8, '0');
    }
    for (let i = 0; i + 5 <= bin.length; i += 5) {
      const index = parseInt(bin.substring(i, i + 5), 2);
      secret += this.base32Chars[index];
    }
    return secret;
  }

  // Decode Base32 string to Buffer
  static base32Decode(base32: string): Buffer {
    base32 = base32.toUpperCase().replace(/=+$/, '');
    let bin = '';
    for (let i = 0; i < base32.length; i++) {
      const idx = this.base32Chars.indexOf(base32[i]);
      if (idx === -1) {
        throw new Error('Invalid base32 character');
      }
      bin += idx.toString(2).padStart(5, '0');
    }
    const bytes: number[] = [];
    for (let i = 0; i + 8 <= bin.length; i += 8) {
      bytes.push(parseInt(bin.substring(i, i + 8), 2));
    }
    return Buffer.from(bytes);
  }

  // Generate TOTP code for a secret at a given timestamp/counter
  static generateCode(secret: string, timeStep = 30): string {
    const key = this.base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / timeStep);

    // Convert counter to 8-byte buffer
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter), 0);

    const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = code % 1000000;
    return otp.toString().padStart(6, '0');
  }

  // Verify TOTP code with time window tolerance (e.g. window = 1 step before or after)
  static verifyCode(
    secret: string,
    code: string,
    window = 1,
    timeStep = 30,
  ): boolean {
    try {
      const key = this.base32Decode(secret);
      const baseCounter = Math.floor(Date.now() / 1000 / timeStep);

      for (let i = -window; i <= window; i++) {
        const counter = baseCounter + i;
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(BigInt(counter), 0);

        const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
        const offset = hmac[hmac.length - 1] & 0xf;
        const generated =
          ((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff);

        const otp = generated % 1000000;
        if (otp.toString().padStart(6, '0') === code) {
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }
}
