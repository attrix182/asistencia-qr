import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AttendanceRecord } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private firestore: Firestore = inject(Firestore);
  private attendanceCollection = collection(this.firestore, 'attendance');

  constructor() { }

  getAttendanceLogs(): Observable<AttendanceRecord[]> {
    const logQuery = query(this.attendanceCollection, orderBy('timestamp', 'desc'));
    return collectionData(logQuery, { idField: 'id' }) as Observable<AttendanceRecord[]>;
  }

  async markAttendance(record: Omit<AttendanceRecord, 'id' | 'timestamp'>) {
    return addDoc(this.attendanceCollection, {
      ...record,
      timestamp: serverTimestamp()
    });
  }
}
