const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** Convert an ArrayBuffer to a base64 string (no Node Buffer in RN). */
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    chunks.push(
      BASE64_CHARS[b0 >> 2] +
        BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)] +
        (i + 1 < bytes.length ? BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=') +
        (i + 2 < bytes.length ? BASE64_CHARS[b2 & 63] : '='),
    );
  }
  return chunks.join('');
};
