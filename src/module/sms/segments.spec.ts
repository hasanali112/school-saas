import { countSegments, GSM7_SEGMENT, UNICODE_SEGMENT } from './segments';

describe('countSegments', () => {
  it('counts a short English message as one GSM-7 segment', () => {
    expect(countSegments('Your child was absent today.')).toEqual({
      encoding: 'gsm7',
      chars: 28,
      segments: 1,
    });
  });

  it('counts a 160-character GSM-7 message as one segment and 161 as two', () => {
    expect(countSegments('a'.repeat(GSM7_SEGMENT)).segments).toBe(1);
    expect(countSegments('a'.repeat(GSM7_SEGMENT + 1)).segments).toBe(2);
  });

  it('charges two units for GSM-7 extension characters like the euro sign and braces', () => {
    expect(countSegments('{€}')).toEqual({
      encoding: 'gsm7',
      chars: 6,
      segments: 1,
    });
  });

  it('counts a 70-character Bangla message as one Unicode segment', () => {
    expect(countSegments('ক'.repeat(UNICODE_SEGMENT))).toEqual({
      encoding: 'unicode',
      chars: 70,
      segments: 1,
    });
  });

  it('counts a 71-character Bangla message as two segments (F1-12 acceptance)', () => {
    expect(countSegments('ক'.repeat(UNICODE_SEGMENT + 1)).segments).toBe(2);
  });

  it('uses 67-character parts once a Unicode message is concatenated', () => {
    expect(countSegments('ক'.repeat(134)).segments).toBe(2);
    expect(countSegments('ক'.repeat(135)).segments).toBe(3);
  });

  it('switches the whole message to Unicode when a single non-GSM character appears', () => {
    expect(countSegments('a'.repeat(100) + 'ক')).toEqual({
      encoding: 'unicode',
      chars: 101,
      segments: 2,
    });
  });

  it('counts an emoji as two UTF-16 units', () => {
    expect(countSegments('👍')).toEqual({
      encoding: 'unicode',
      chars: 2,
      segments: 1,
    });
  });

  it('treats an empty message as zero segments', () => {
    expect(countSegments('')).toEqual({
      encoding: 'gsm7',
      chars: 0,
      segments: 0,
    });
  });
});
