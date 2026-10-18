import { extractMergeFields, renderTemplate } from './template-render';

describe('renderTemplate', () => {
  it('substitutes every {{field}} with its value', () => {
    expect(
      renderTemplate(
        'Dear {{guardianName}}, {{studentName}} was absent on {{date}}.',
        {
          guardianName: 'Rahim',
          studentName: 'Karim',
          date: '2026-09-08',
        },
      ),
    ).toBe('Dear Rahim, Karim was absent on 2026-09-08.');
  });

  it('tolerates spaces inside the braces and repeats a field', () => {
    expect(renderTemplate('{{ name }} / {{name}}', { name: 'X' })).toBe(
      'X / X',
    );
  });

  it('throws naming every missing field', () => {
    expect(() => renderTemplate('{{a}} {{b}} {{c}}', { a: '1' })).toThrow(
      'Missing merge fields: b, c',
    );
  });

  it('leaves text without placeholders untouched', () => {
    expect(renderTemplate('plain', {})).toBe('plain');
  });
});

describe('extractMergeFields', () => {
  it('lists unique field names in order of first appearance', () => {
    expect(extractMergeFields('{{b}} {{a}} {{ b }}')).toEqual(['b', 'a']);
  });
});
