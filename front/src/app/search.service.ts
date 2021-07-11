import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export class SearchArgs {

  constructor(text: string = '') {
    this.text = text;
    this.args = new Map();
  }


  private text: string;
  private args: Map<string, string[]>;

  setText(text: string): void {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }

  addArgument(name: string, value: string[]): void {
    this.args.set(name, value);
  }

  removeArgument(name: string): void {
    this.args.delete(name);
  }

  getArgs(): Map<string, string[]> {
    return this.args;
  }
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
      this.searchArgs.setText(text);
    }
    if (args !== null) {
      for (const [key, value] of args) {
        this.searchArgs.addArgument(key, value);
      }
    }
    this.searchSubject.next(this.searchArgs);
  }

  removeArgument(name: string) {
    this.searchArgs.removeArgument(name);
  }
}
