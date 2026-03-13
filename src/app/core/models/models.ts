export interface Person {
    id: string;      // Generated Document ID
    nombre: string;
    apellido: string;
}

export interface AttendanceRecord {
    id?: string;
    personId: string;
    nombre: string;
    apellido: string;
    timestamp: Date | any; // firebase timestamp
}
