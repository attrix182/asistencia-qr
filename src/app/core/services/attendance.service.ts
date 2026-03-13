import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, serverTimestamp, where, getDocs, doc, deleteDoc } from '@angular/fire/firestore';
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

  async hasAttendanceToday(personId: string): Promise<boolean> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayQuery = query(
      this.attendanceCollection,
      where('personId', '==', personId),
      where('timestamp', '>=', startOfDay),
      where('timestamp', '<=', endOfDay)
    );

    const snapshot = await getDocs(todayQuery);
    return !snapshot.empty;
  }

  async deleteAttendance(id: string): Promise<void> {
    const attendanceDoc = doc(this.firestore, 'attendance', id);
    await deleteDoc(attendanceDoc);
  }
}
