import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  /**
   * Hashes a plaintext password using Argon2id with OWASP-recommended parameters.
   * Variant: Argon2id (resistant to GPU/ASIC cracking and side-channel timing attacks).
   * Memory Cost: 65536 KiB (64 MB), Time Cost: 3 iterations, Parallelism: 4 threads.
   */
  async hash(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }

  /**
   * Compares a plaintext password against a stored password hash.
   * Supports Argon2id natively, and gracefully falls back to bcrypt for legacy records.
   */
  async compare(plainPassword: string, passwordHash: string): Promise<boolean> {
    if (!plainPassword || !passwordHash) {
      return false;
    }

    try {
      if (passwordHash.startsWith('$argon2')) {
        return await argon2.verify(passwordHash, plainPassword);
      }

      // Legacy bcrypt fallback
      if (passwordHash.startsWith('$2')) {
        return await bcrypt.compare(plainPassword, passwordHash);
      }

      return false;
    } catch (err: any) {
      this.logger.error(`Error comparing password hash: ${err.message}`);
      return false;
    }
  }
}
