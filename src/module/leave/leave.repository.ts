import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, gte, lte, SQL } from 'drizzle-orm';
import { DatabaseService } from '@database/database.service';
import {
  LeaveApplicationRow,
  leaveApplications,
  LeaveTypeRow,
  leaveTypes,
  NewLeaveApplicationRow,
  NewLeaveTypeRow,
} from '@database/schema';

export interface LeaveFilter {
  status?: LeaveApplicationRow['status'];
  kind?: LeaveApplicationRow['applicantKind'];
}

@Injectable()
export class LeaveRepository {
  constructor(private readonly database: DatabaseService) {}

  insertType(data: NewLeaveTypeRow): Promise<LeaveTypeRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(leaveTypes).values(data).returning();
      return row;
    });
  }

  findTypes(): Promise<LeaveTypeRow[]> {
    return this.database.tenant((tx) =>
      tx.select().from(leaveTypes).orderBy(asc(leaveTypes.name)),
    );
  }

  findTypeById(id: string): Promise<LeaveTypeRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.leaveTypes.findFirst({ where: eq(leaveTypes.id, id) }),
    );
  }

  insertApplication(
    data: NewLeaveApplicationRow,
  ): Promise<LeaveApplicationRow> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx.insert(leaveApplications).values(data).returning();
      return row;
    });
  }

  findApplications(filter: LeaveFilter): Promise<LeaveApplicationRow[]> {
    const clauses: SQL[] = [];
    if (filter.status)
      clauses.push(eq(leaveApplications.status, filter.status));
    if (filter.kind)
      clauses.push(eq(leaveApplications.applicantKind, filter.kind));
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(leaveApplications)
        .where(clauses.length ? and(...clauses) : undefined)
        .orderBy(desc(leaveApplications.createdAt)),
    );
  }

  findById(id: string): Promise<LeaveApplicationRow | undefined> {
    return this.database.tenant((tx) =>
      tx.query.leaveApplications.findFirst({
        where: eq(leaveApplications.id, id),
      }),
    );
  }

  /** Approved applications of the same applicant and type inside a calendar year, for the cap check. */
  findApprovedInYear(
    applicant: { userId?: string | null; studentId?: string | null },
    leaveTypeId: string,
    year: number,
  ): Promise<LeaveApplicationRow[]> {
    const who = applicant.userId
      ? eq(leaveApplications.userId, applicant.userId)
      : eq(leaveApplications.studentId, applicant.studentId!);
    return this.database.tenant((tx) =>
      tx
        .select()
        .from(leaveApplications)
        .where(
          and(
            who,
            eq(leaveApplications.leaveTypeId, leaveTypeId),
            eq(leaveApplications.status, 'approved'),
            gte(leaveApplications.fromDate, `${year}-01-01`),
            lte(leaveApplications.toDate, `${year}-12-31`),
          ),
        ),
    );
  }

  /** Transitions only from pending; returns undefined if the row was not pending (or not ours). */
  decide(
    id: string,
    status: 'approved' | 'rejected' | 'cancelled',
    decidedBy: string,
    note?: string,
  ): Promise<LeaveApplicationRow | undefined> {
    return this.database.tenant(async (tx) => {
      const [row] = await tx
        .update(leaveApplications)
        .set({ status, decidedBy, decidedAt: new Date(), decisionNote: note })
        .where(
          and(
            eq(leaveApplications.id, id),
            eq(leaveApplications.status, 'pending'),
          ),
        )
        .returning();
      return row;
    });
  }
}
