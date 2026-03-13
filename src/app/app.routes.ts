import { Routes } from '@angular/router';
import { RegistrationComponent } from './features/registration/registration.component';
import { ScannerComponent } from './features/scanner/scanner.component';
import { AttendanceListComponent } from './features/attendance-list/attendance-list.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent, canActivate: [authGuard] },
  { path: 'scanner', component: ScannerComponent },
  { path: 'attendance', component: AttendanceListComponent },
  { path: '', redirectTo: 'scanner', pathMatch: 'full' }
];
