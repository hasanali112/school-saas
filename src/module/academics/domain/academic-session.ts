/** An academic year ("2027" or "2027-28"); exactly one per institution is current. */
export interface AcademicSession {
  id: string;
  institutionId: string;
  name: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
  createdAt: Date;
}

export interface NewAcademicSession {
  institutionId: string;
  name: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
}
