import { ClassRow, SectionRow } from '@database/schema';
import { ClassResponseDto } from './academics.response.dto';

const cls = (id: string, ordinal: number): ClassRow => ({
  id,
  institutionId: 'i',
  name: `Class ${ordinal}`,
  ordinal,
  createdAt: new Date(),
});
const sec = (id: string, classId: string, name: string): SectionRow => ({
  id,
  institutionId: 'i',
  classId,
  shiftId: null,
  name,
  createdAt: new Date(),
});

describe('ClassResponseDto.fromMany', () => {
  it('groups sections under their class and gives empty arrays to classes without sections', () => {
    const result = ClassResponseDto.fromMany(
      [cls('c6', 6), cls('c7', 7)],
      [sec('s1', 'c6', 'A'), sec('s2', 'c6', 'B'), sec('s3', 'c7', 'A')],
    );

    expect(result.map((c) => c.sections.map((s) => s.name))).toEqual([
      ['A', 'B'],
      ['A'],
    ]);
    expect(ClassResponseDto.fromMany([cls('c8', 8)], [])[0].sections).toEqual(
      [],
    );
  });
});
