/** Morning / day shift; sections may belong to one. */
export interface Shift {
  id: string;
  institutionId: string;
  name: string;
  createdAt: Date;
}

export interface NewShift {
  institutionId: string;
  name: string;
}
