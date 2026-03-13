import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { Observable } from 'rxjs';
import { Person } from '../../core/models/models';
import { PeopleService } from '../../core/services/people.service';
import * as FileSaver from 'file-saver';
import JSZip from 'jszip';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QRCodeComponent],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  people$!: Observable<Person[]>;
  registrationForm: FormGroup;
  private peopleService = inject(PeopleService);
  private fb = inject(FormBuilder);

  isSubmitting = false;

  constructor() {
    this.registrationForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.people$ = this.peopleService.getPeople();
  }

  async onSubmit() {
    if (this.registrationForm.invalid) return;

    this.isSubmitting = true;
    try {
      await this.peopleService.addPerson({
        nombre: this.registrationForm.value.nombre,
        apellido: this.registrationForm.value.apellido
      });
      this.registrationForm.reset();
    } catch (e) {
      console.error(e);
    } finally {
      this.isSubmitting = false;
    }
  }

  getQrData(person: Person): string {
    return JSON.stringify({ nombre: person.nombre, apellido: person.apellido, id: person.id });
  }

  downloadIndividualQr(person: Person) {
    const canvas = document.querySelector(`#qr-${person.id} canvas`) as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      FileSaver.saveAs(dataUrl, `${person.nombre}_${person.apellido}_QR.png`);
    }
  }

  async downloadAll(people: Person[]) {
    const zip = new JSZip();
    const folder = zip.folder("QRs");

    for (const person of people) {
      const canvas = document.querySelector(`#qr-${person.id} canvas`) as HTMLCanvasElement;
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        const base64Data = dataUrl.split(',')[1];
        folder?.file(`${person.nombre}_${person.apellido}_QR.png`, base64Data, { base64: true });
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(content, "Todos_los_QRs.zip");
  }
}


