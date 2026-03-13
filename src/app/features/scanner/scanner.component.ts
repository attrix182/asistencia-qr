import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LOAD_WASM, NgxScannerQrcodeComponent, ScannerQRCodeResult } from 'ngx-scanner-qrcode';

// Necessary configuration for the scanner to load wasm files properly in Angular 18+
LOAD_WASM().subscribe();
import { AttendanceService } from '../../core/services/attendance.service';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, NgxScannerQrcodeComponent],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ScannerComponent {
  private attendanceService = inject(AttendanceService);
  isProcessing = false;
  lastScannedMessage = '';
  scannerConfig = {
    fps: 10,
    vibrate: 200,
    constraints: {
      video: {
        facingMode: { exact: 'environment' as const }
      }
    }
  };

  async onEvent(e: ScannerQRCodeResult[], action?: any): Promise<void> {
    if (!e || e.length === 0 || this.isProcessing) return;

    try {
      this.isProcessing = true;
      const result = JSON.parse(e[0].value);

      if (result.id && result.nombre && result.apellido) {
        await this.attendanceService.markAttendance({
          personId: result.id,
          nombre: result.nombre,
          apellido: result.apellido
        });

        this.lastScannedMessage = `Asistencia registrada para ${result.nombre} ${result.apellido}.`;

        // Pause the scanner momentarily after a successful scan
        if (action) {
          action.pause();
          setTimeout(() => {
            this.lastScannedMessage = '';
            this.isProcessing = false;
            action.play();
          }, 2500);
        }
      } else {
        throw new Error('Formato de QR inválido');
      }
    } catch (err) {
      console.error('Error procesando QR:', err);
      this.lastScannedMessage = 'Error: QR no válido. Intente de nuevo.';
      this.isProcessing = false;
    }
  }
}
