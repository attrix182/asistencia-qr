import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Person } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  private firestore: Firestore = inject(Firestore);
  private peopleCollection = collection(this.firestore, 'people');

  constructor() { }

  getPeople(): Observable<Person[]> {
    const peopleQuery = query(this.peopleCollection, orderBy('nombre', 'asc'));
    return collectionData(peopleQuery, { idField: 'id' }) as Observable<Person[]>;
  }

  async addPerson(person: Omit<Person, 'id'>) {
    return addDoc(this.peopleCollection, person);
  }
}
