/** A class (grade) such as "Six"; `ordinal` orders them. */
export interface SchoolClass {
  id: string;
  institutionId: string;
  name: string;
  ordinal: number;
  createdAt: Date;
}

export interface NewSchoolClass {
  institutionId: string;
  name: string;
  ordinal: number;
}

export interface Section {
  id: string;
  institutionId: string;
  classId: string;
  shiftId: string | null;
  name: string;
  createdAt: Date;
}

export interface NewSection {
  institutionId: string;
  classId: string;
  shiftId: string | null;
  name: string;
}

export interface ClassesWithSections {
  classes: SchoolClass[];
  sections: Section[];
}

/** Class and section names of one section; what the student import matches rows against. */
export interface SectionRef {
  sectionId: string;
  classId: string;
  className: string;
  sectionName: string;
}
