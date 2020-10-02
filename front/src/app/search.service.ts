import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export class SearchArgs {
  constructor(text: string = '') {
    this.text = text;
    this.args = new Map();
  }

  text: string;
  args: Map<string, string[]>;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchArgs = new SearchArgs();
  private searchSubject = new BehaviorSubject<SearchArgs>(this.searchArgs);

  searchArgsOb = this.searchSubject.asObservable();

  constructor() { }

  changeSearchText(text: string = null, args: Map<string, string[]> = null): void {
    if (text !== null) {
      this.searchArgs.text = text;
    }
    if (args !== null) {
      for (const [key, value] of Object.entries(args)) {
        this.searchArgs.args[key] = value;
      }
    }
    this.searchSubject.next(this.searchArgs);
  }
}
