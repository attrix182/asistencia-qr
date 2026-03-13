import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'qr-app:isLoggedIn';
  private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored === 'true') {
        this.loggedIn$.next(true);
      }
    } catch {
      // ignore storage errors (SSR, private mode, etc.)
    }
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  isLoggedIn(): boolean {
    return this.loggedIn$.value;
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      this.loggedIn$.next(true);
      try {
        localStorage.setItem(this.STORAGE_KEY, 'true');
      } catch {
        // ignore storage errors
      }
      return true;
    }

    this.loggedIn$.next(false);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    return false;
  }

  logout(): void {
    this.loggedIn$.next(false);
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }
}

