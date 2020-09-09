import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchTextSubject = new BehaviorSubject('');

  searchText = this.searchTextSubject.asObservable();

  constructor() { }

  changeSearchText(text: string): void {
    this.searchTextSubject.next(text);
  }
}
