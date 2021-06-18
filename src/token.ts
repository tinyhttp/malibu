import { hash, randomBase62, timeSafeCompare, typeSafeUID } from "./utils";

interface TokenOptions {
  saltLength: number;
  secretLength: number;
}

/**
 * Token Generation.
 * A rewrite of https://github.com/pillarjs/csrf.
 * @class Tokens
 * @license MIT Copyright (c) Jonathan Ong <me@jongleberry.com> and Douglas Christopher Wilson <doug@somethingdoug.com>
 */
export class Tokens {
  saltLength: number;
  secretLength: number;

  constructor(options: TokenOptions) {
    this.saltLength = options.saltLength;
    this.secretLength = options.secretLength;
  }

  create(secret: string): string {
    return this.tokenize(secret, randomBase62(this.saltLength));
  }

  secret(): string {
    return typeSafeUID(this.secretLength);
  }

  verify(secret: string, token: string): boolean {
    const index = token?.indexOf("-");
    if (index === -1 || index === undefined) {
      return false;
    }

    const salt = token.substr(0, index);
    const expected = this.tokenize(secret, salt);

    return timeSafeCompare(token, expected);
  }

  tokenize(secret: string, salt: string): string {
    return salt + "-" + hash(salt + "-" + secret);
  }
}
