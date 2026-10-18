/**
 * SMS segment arithmetic (F1-12). Operators bill per segment: GSM-7 messages fit 160
 * characters in one segment and 153 per part once concatenated; anything outside the
 * GSM-7 alphabet (all Bangla) forces UCS-2, where a segment holds 70 UTF-16 units and
 * a part 67. Extension-table characters (euro, braces, backslash …) cost two units.
 */
export const GSM7_SEGMENT = 160;
export const GSM7_PART = 153;
export const UNICODE_SEGMENT = 70;
export const UNICODE_PART = 67;

export type SmsEncoding = 'gsm7' | 'unicode';

export interface SegmentCount {
  encoding: SmsEncoding;
  /** Billable units: GSM-7 septets or UTF-16 code units. */
  chars: number;
  segments: number;
}

const GSM7_BASIC =
  '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
  '¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM7_EXTENSION = '\f^{}\\[~]|€';

const BASIC = new Set(GSM7_BASIC);
const EXTENSION = new Set(GSM7_EXTENSION);

/** Septet cost of a GSM-7 message, or undefined when a character is outside the alphabet. */
function gsm7Length(text: string): number | undefined {
  let length = 0;
  for (const ch of text) {
    if (BASIC.has(ch)) length += 1;
    else if (EXTENSION.has(ch)) length += 2;
    else return undefined;
  }
  return length;
}

function segmentsFor(chars: number, single: number, part: number): number {
  if (chars === 0) return 0;
  return chars <= single ? 1 : Math.ceil(chars / part);
}

export function countSegments(text: string): SegmentCount {
  const septets = gsm7Length(text);
  if (septets !== undefined) {
    return {
      encoding: 'gsm7',
      chars: septets,
      segments: segmentsFor(septets, GSM7_SEGMENT, GSM7_PART),
    };
  }
  // String#length is UTF-16 code units, which is exactly what UCS-2 bills.
  const units = text.length;
  return {
    encoding: 'unicode',
    chars: units,
    segments: segmentsFor(units, UNICODE_SEGMENT, UNICODE_PART),
  };
}
