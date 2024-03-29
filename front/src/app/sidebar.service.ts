import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private subject = new Subject<void>();
  sidebarOb = this.subject.asObservable();

  constructor() { }

  toggle(): void {
    this.subject.next();
  }
}
