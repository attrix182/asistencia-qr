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
  pendingScan: { id: string; nombre: string; apellido: string } | null = null;
  showConfirmModal = false;
  showAlreadyAttendedModal = false;
  private scannerActionRef: any | null = null;
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
      this.scannerActionRef = action;
      const rawValue = e[0].value;
      console.log('QR raw value (tipo, valor):', typeof rawValue, rawValue);

      if (!rawValue) {
        throw new Error('QR sin contenido');
      }

      let result: any;

      try {
        result = JSON.parse(rawValue);

        // En algunos navegadores/formatos el contenido puede venir como string JSON anidado
        if (typeof result === 'string') {
          result = JSON.parse(result);
        }
      } catch (parseError) {
        console.error('Contenido QR recibido (no JSON válido):', rawValue);
        throw new Error('Formato de QR inválido');
      }

      if (result.id && result.nombre && result.apellido) {
        const alreadyAttended = await this.attendanceService.hasAttendanceToday(result.id);

        if (alreadyAttended) {
          this.lastScannedMessage = 'Esta persona ya registró asistencia el día de hoy.';
          this.showAlreadyAttendedModal = true;

          if (this.scannerActionRef) {
            this.scannerActionRef.pause();
          }

          this.isProcessing = false;
          return;
        }

        this.pendingScan = {
          id: result.id,
          nombre: result.nombre,
          apellido: result.apellido
        };

        this.showConfirmModal = true;

        if (this.scannerActionRef) {
          this.scannerActionRef.pause();
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

  async confirmAttendance() {
    if (!this.pendingScan) return;

    try {
      await this.attendanceService.markAttendance({
        personId: this.pendingScan.id,
        nombre: this.pendingScan.nombre,
        apellido: this.pendingScan.apellido
      });

      this.lastScannedMessage = `Asistencia registrada para ${this.pendingScan.nombre} ${this.pendingScan.apellido}.`;
    } catch (err) {
      console.error('Error guardando asistencia:', err);
      this.lastScannedMessage = 'Error al guardar la asistencia. Intente de nuevo.';
    } finally {
      this.pendingScan = null;
      this.showConfirmModal = false;
      this.isProcessing = false;

      if (this.scannerActionRef) {
        this.scannerActionRef.play();
      }
    }
  }

  cancelAttendance() {
    this.pendingScan = null;
    this.showConfirmModal = false;
    this.isProcessing = false;

    if (this.scannerActionRef) {
      this.scannerActionRef.play();
    }
  }

  closeAlreadyAttendedModal() {
    this.showAlreadyAttendedModal = false;
    this.isProcessing = false;

    if (this.scannerActionRef) {
      this.scannerActionRef.play();
    }
  }
}
