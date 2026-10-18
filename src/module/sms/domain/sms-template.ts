/** An institution's override of a built-in template, or its own template; `{{field}}` merge fields. */
export interface SmsTemplate {
  id: string;
  institutionId: string;
  key: string;
  name: string;
  body: string;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewSmsTemplate {
  institutionId: string;
  key: string;
  name: string;
  body: string;
  updatedBy: string | null;
}

/** A built-in template's name and body. */
export interface TemplateText {
  name: string;
  body: string;
}
