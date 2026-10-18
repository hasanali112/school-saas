/** Built-in templates every institution starts with; an institution row with the same key overrides the body. */
export const DEFAULT_TEMPLATES = {
  absence: {
    name: 'Absence notice',
    body: 'প্রিয় {{guardianName}}, {{studentName}} ({{className}}-{{sectionName}}, রোল {{rollNo}}) আজ {{date}} বিদ্যালয়ে অনুপস্থিত ছিল। - {{institutionName}}',
  },
  due_reminder: {
    name: 'Fee due reminder',
    body: 'প্রিয় {{guardianName}}, {{studentName}} ({{className}}-{{sectionName}}) এর বকেয়া ফি পরিশোধের অনুরোধ করা হলো। - {{institutionName}}',
  },
  general: {
    name: 'General notice',
    body: '{{institutionName}}: ',
  },
} as const;

export type DefaultTemplateKey = keyof typeof DEFAULT_TEMPLATES;
