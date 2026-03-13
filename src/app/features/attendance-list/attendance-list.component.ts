import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject, combineLatest, map } from 'rxjs';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceRecord } from '../../core/models/models';

type AttendanceGroup = {
  date: Date;
  records: AttendanceRecord[];
};

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.scss'
})
export class AttendanceListComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  attendance$!: Observable<AttendanceRecord[]>;
  attendanceByDay$!: Observable<AttendanceGroup[]>;

  selectedDate$ = new BehaviorSubject<string | null>(null);

  ngOnInit(): void {
    this.attendance$ = this.attendanceService.getAttendanceLogs();
    this.attendanceByDay$ = combineLatest([
      this.attendance$,
      this.selectedDate$
    ]).pipe(
      map(([records, selectedDate]) => {
        const groups = this.groupByDay(records);

        if (!selectedDate) {
          return groups;
        }

        // Filtrar solo el día seleccionado (yyyy-MM-dd)
        return groups.filter(group => {
          const key = group.date.toISOString().substring(0, 10);
          return key === selectedDate;
        });
      })
    );
  }

  onDateChange(value: string) {
    this.selectedDate$.next(value || null);
  }

  private getDateFromTimestamp(timestamp: any): Date {
    if (!timestamp) {
      return new Date(0);
    }

    if (timestamp.toDate) {
      return timestamp.toDate();
    }

    return new Date(timestamp);
  }

  private groupByDay(records: AttendanceRecord[]): AttendanceGroup[] {
    const groupsMap = new Map<string, AttendanceGroup>();

    for (const record of records) {
      const dateObj = this.getDateFromTimestamp((record as any).timestamp);
      const key = dateObj.toISOString().substring(0, 10); // yyyy-MM-dd

      if (!groupsMap.has(key)) {
        groupsMap.set(key, { date: dateObj, records: [] });
      }

      groupsMap.get(key)!.records.push(record);
    }

    // Ordenar por fecha descendente (más reciente primero)
    return Array.from(groupsMap.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }
}

