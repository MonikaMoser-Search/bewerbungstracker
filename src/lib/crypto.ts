const KDF_ITERATIONS = 600_000;
const FORMAT_NAME = 'bewerbungstracker-encrypted';
const FORMAT_VERSION = 1 as const;

export type VerschluesselteDatei = {
  format: typeof FORMAT_NAME;
  format_version: typeof FORMAT_VERSION;
  kdf: 'PBKDF2-SHA256';
  kdf_iterations: number;
  salt: string;
  iv: string;
  ciphertext: string;
};

async function ableiteSchluessel(passwort: string, salt: Uint8Array): Promise<CryptoKey> {
  const passwortBytes = new TextEncoder().encode(passwort);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwortBytes as BufferSource,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: KDF_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function verschluesseln(
  klartext: string,
  passwort: string
): Promise<VerschluesselteDatei> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await ableiteSchluessel(passwort, salt);
  const klartextBytes = new TextEncoder().encode(klartext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource },
    key,
    klartextBytes as BufferSource
  );
  return {
    format: FORMAT_NAME,
    format_version: FORMAT_VERSION,
    kdf: 'PBKDF2-SHA256',
    kdf_iterations: KDF_ITERATIONS,
    salt: bytesZuBase64(salt),
    iv: bytesZuBase64(iv),
    ciphertext: bytesZuBase64(new Uint8Array(ciphertext)),
  };
}

export async function entschluesseln(
  datei: VerschluesselteDatei,
  passwort: string
): Promise<string> {
  const salt = base64ZuBytes(datei.salt);
  const iv = base64ZuBytes(datei.iv);
  const ciphertext = base64ZuBytes(datei.ciphertext);
  const key = await ableiteSchluessel(passwort, salt);
  let klartextBytes: ArrayBuffer;
  try {
    klartextBytes = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      ciphertext as BufferSource
    );
  } catch {
    throw new Error('Passwort falsch oder Datei beschädigt.');
  }
  return new TextDecoder().decode(klartextBytes);
}

export function istVerschluesselteDatei(parsed: unknown): parsed is VerschluesselteDatei {
  if (typeof parsed !== 'object' || parsed === null) return false;
  const p = parsed as Record<string, unknown>;
  return (
    p.format === FORMAT_NAME &&
    p.format_version === FORMAT_VERSION &&
    typeof p.salt === 'string' &&
    typeof p.iv === 'string' &&
    typeof p.ciphertext === 'string'
  );
}

export type PasswortStaerke = {
  punkte: 0 | 1 | 2 | 3 | 4 | 5;
  label: 'sehr schwach' | 'schwach' | 'mittel' | 'gut' | 'stark' | 'sehr stark';
};

export function passwortStaerke(passwort: string): PasswortStaerke {
  let punkte = 0;
  if (passwort.length >= 12) punkte++;
  if (passwort.length >= 16) punkte++;
  if (/[a-z]/.test(passwort) && /[A-Z]/.test(passwort)) punkte++;
  if (/[0-9]/.test(passwort)) punkte++;
  if (/[^A-Za-z0-9]/.test(passwort)) punkte++;
  const labels: PasswortStaerke['label'][] = [
    'sehr schwach',
    'sehr schwach',
    'schwach',
    'mittel',
    'gut',
    'stark',
  ];
  return {
    punkte: punkte as PasswortStaerke['punkte'],
    label: labels[punkte],
  };
}

function bytesZuBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ZuBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
