import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AttendanceService } from '../../core/services/attendance.service';
import { AttendanceRecord } from '../../core/models/models';

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

  ngOnInit(): void {
    this.attendance$ = this.attendanceService.getAttendanceLogs();
  }
}

