import { Routes } from '@angular/router';
import { RegistrationComponent } from './features/registration/registration.component';
import { ScannerComponent } from './features/scanner/scanner.component';
import { AttendanceListComponent } from './features/attendance-list/attendance-list.component';

export const routes: Routes = [
  { path: 'registration', component: RegistrationComponent },
  { path: 'scanner', component: ScannerComponent },
  { path: 'attendance', component: AttendanceListComponent },
  { path: '', redirectTo: 'registration', pathMatch: 'full' }
];
