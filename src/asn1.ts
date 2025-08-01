/**
 * ASN1 prefix which precedes the private key in DER ASN.1 format.
 * Contains identifiers for Ed25519 together with meta bytes
 * for length and others.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8410
 * @see https://datatracker.ietf.org/doc/html/rfc5208
 * @see example https://lapo.it/asn1js/#MCowBQYDK2VwAyEAYNUhOe_8hqFet7VdDSO4372OFw0whAWJ8VAlPPXAPGY
 */
export const ASN1_PRIVATE_PREFIX = "302e020100300506032b657004220420";

/**
 * ASN1 prefix which precedes the public key in
 * Contains identifiers for Ed25519 together with meta bytes
 * for length and others.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8410
 * @see https://datatracker.ietf.org/doc/html/rfc5208
 * @see example https://lapo.it/asn1js/#MC4CAQAwBQYDK2VwBCIEIM6DAyVnD64eFWkToBL_uYqsTzKe4qasTvu5xnJrRhHF
 */
export const ASN1_PUBLIC_PREFIX = "302a300506032b6570032100";

/**
 * ASN1 prefix which precedes the salt in pkcs5 encoded encrypted key.
 * Contains identifiers for PBES2 and PBKDF2 together with meta bytes
 * for length and others.
 *
 * @see https://www.rfc-editor.org/rfc/rfc2898
 */
export const ASN1_PKCS5_SALT_PREFIX =
  "30819b305706092a864886f70d01050d304a302906092a864886f70d01050c301c0408";

/**
 * ASN1 prefix which precedes the iterations count in pkcs5 encoded encrypted key.
 * Contains meta bytes for length and others.
 *
 * @see https://www.rfc-editor.org/rfc/rfc2898
 * @see example https://lapo.it/asn1js/#MIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAhZEct9sFzlqQICCAAwDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEELA0tLQ9x46HowOAowRFlHsEQI9KqZlY2pGgnywanIaPmH6ZuRDhxIJVP_w4y7_dV161UZnxjcKwPq070D3gZXcguucm1BeOVnq6P_e2kj75344
 */
export const ASN1_PKCS5_ITERATIONS_PREFIX = "0202";

/**
 * ASN1 prefix which precedes the initialization vector in pkcs5 encoded encrypted key.
 * Contains identifiers for hmacWithSHA256 and aes256-CBC  together with meta bytes
 * for length and others.
 *
 * @see https://www.rfc-editor.org/rfc/rfc2898
 * @see example https://lapo.it/asn1js/#MIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAhZEct9sFzlqQICCAAwDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEELA0tLQ9x46HowOAowRFlHsEQI9KqZlY2pGgnywanIaPmH6ZuRDhxIJVP_w4y7_dV161UZnxjcKwPq070D3gZXcguucm1BeOVnq6P_e2kj75344
 */
export const ASN1_PKCS5_IV_PREFIX =
  "300c06082a864886f70d02090500301d060960864801650304012a0410";

/**
 * ASN1 prefix which precedes the encrypted value pkcs5 encoded encrypted key.
 * Contains meta bytes for length and others.
 *
 * @see https://www.rfc-editor.org/rfc/rfc2898
 * @see example https://lapo.it/asn1js/#MIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAhZEct9sFzlqQICCAAwDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEELA0tLQ9x46HowOAowRFlHsEQI9KqZlY2pGgnywanIaPmH6ZuRDhxIJVP_w4y7_dV161UZnxjcKwPq070D3gZXcguucm1BeOVnq6P_e2kj75344
 */
export const ASN1_PKCS5_VALUE_PREFIX = "0440";

/**
 * Regex which represents DER encoded ASN1 for passphrase encrypted 256bit key as defined by pkcs5 2.0 specification.
 * Although pkcs5 supports multiple options for digest and encryption algorithms, for our purposes we are using strict choices
 * when encrypting the key:
 * - PBES2 encryption scheme
 * - PBKDF2 key derivation function
 * - SHA-256 digest for deriving key from passphrase
 * - AES-CBC-256 encryption algorithm for encrypting the key
 *
 * @see https://www.rfc-editor.org/rfc/rfc2898
 * @see example https://lapo.it/asn1js/#MIGbMFcGCSqGSIb3DQEFDTBKMCkGCSqGSIb3DQEFDDAcBAhZEct9sFzlqQICCAAwDAYIKoZIhvcNAgkFADAdBglghkgBZQMEASoEELA0tLQ9x46HowOAowRFlHsEQI9KqZlY2pGgnywanIaPmH6ZuRDhxIJVP_w4y7_dV161UZnxjcKwPq070D3gZXcguucm1BeOVnq6P_e2kj75344
 */
export const ASN1_PKCS5_REGEX = new RegExp(
  `^${ASN1_PKCS5_SALT_PREFIX}(?<salt>[0-9a-f]{16})${ASN1_PKCS5_ITERATIONS_PREFIX}((?<iterations>[0-9a-f]{4}))${ASN1_PKCS5_IV_PREFIX}(?<iv>[0-9a-f]{32})${ASN1_PKCS5_VALUE_PREFIX}(?<value>[0-9a-f]{128})$`
);

/**
 * Parses encrypted key in `pkcs5` format and extracts
 * following components:
 * - salt - used to derive encryption key from password as defined by PBKDF2
 * - iterations - number of iterations used to derive encryption key as defined by PBKDF2
 * - iv - initialization vector used to encrypt as defined by PBES2
 * - value - encrypted key value using AES-256-CBC as defined by PBES2
 *
 * @param pkcs5PayloadHex hex encoded `pkcs5` payload
 * @returns hex encoded payload components
 * @throws if input key doesn't have valid `pkcs5` format
 * @see sections 5.2 and 6.2 in https://www.rfc-editor.org/rfc/rfc2898
 */
export function parsePkcs5EncryptedKey(pkcs5PayloadHex: string) {
  const match = ASN1_PKCS5_REGEX.exec(pkcs5PayloadHex);
  if (!match) {
    throw new Error("Invalid pkcs5 encrypted key format");
  }

  return match.groups as {
    salt: string;
    iterations: string;
    iv: string;
    value: string;
  };
}

/**
 * Asserts that given key has valid `pkcs5` format.
 *
 * @param pkcs5PayloadHex hex encoded `pkcs5` payload
 * @throws if input key has wrong format
 * @see sections 5.2 and 6.2 in https://www.rfc-editor.org/rfc/rfc2898
 */
export function assertPkcs5EncryptedKey(pkcs5PayloadHex: string) {
  if (!isValidPkcs5EncryptedKey(pkcs5PayloadHex)) {
    throw new Error("Invalid pkcs5 encrypted key format");
  }
}

/**
 * Checks if given key has valid `pkcs5` format.
 *
 * @param pkcs5PayloadHex hex encoded `pkcs5` payload
 * @returns true if input key has valid `pkcs5` format, false otherwise
 * @see sections 5.2 and 6.2 in https://www.rfc-editor.org/rfc/rfc2898
 */
export function isValidPkcs5EncryptedKey(pkcs5PayloadHex: string) {
  return ASN1_PKCS5_REGEX.test(pkcs5PayloadHex);
}

/**
 * Converts private key in `der` format to raw private key.
 *
 * @param keyHex hex encoded private key in `der` format
 * @returns hex encoded raw private key
 * @throws if input key has wrong length
 */
export function privateKeyEd25519DerToRaw(keyHex: string) {
  if (keyHex.length != 96) {
    throw new Error(
      `Unexpected der private key length in hex ${keyHex.length}, expected 96`
    );
  }
  if (!keyHex.startsWith(ASN1_PRIVATE_PREFIX)) {
    throw new Error("Unexpected private key prefix");
  }

  // Remove the ASN.1 prefix
  return keyHex.slice(ASN1_PRIVATE_PREFIX.length);
}

/**
 * Converts raw private key to `der` format.
 *
 * @param keyHex hex encoded raw private key
 * @returns hex encoded private key in `der` format
 * @throws if input key has wrong length
 */
export function privateKeyEd25519RawToDer(keyHex: string) {
  if (keyHex.length != 64) {
    throw new Error(
      `Unexpected raw private key length in hex ${keyHex.length}, expected 64`
    );
  }

  // Prepend the ASN.1 prefix to raw key data
  return `${ASN1_PRIVATE_PREFIX}${keyHex}`;
}

/**
 * Converts public key in `der` format to raw public key.
 *
 * @param keyHex hex encoded public key in `der` format
 * @returns hex encoded raw public key
 * @throws if input key has wrong length
 */
export function publicKeyEd25519DerToRaw(keyHex: string) {
  if (keyHex.length != 88) {
    throw new Error(
      `Unexpected der public key length in hex ${keyHex.length}, expected 88`
    );
  }
  if (!keyHex.startsWith(ASN1_PUBLIC_PREFIX)) {
    throw new Error("Unexpected public key prefix");
  }

  // Remove the ASN.1 prefix
  return keyHex.slice(ASN1_PUBLIC_PREFIX.length);
}

/**
 * Converts raw public key to `der` format.
 *
 * @param keyHex hex encoded raw public key
 * @returns hex encoded public key in `der` format
 * @throws if input key has wrong length
 */
export function publicKeyEd25519RawToDer(keyHex: string) {
  if (keyHex.length != 64) {
    throw new Error(
      `Unexpected raw public key length in hex ${keyHex.length}, expected 64`
    );
  }

  // Prepend the ASN.1 prefix to raw key data
  return `${ASN1_PUBLIC_PREFIX}${keyHex}`;
}
