import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


export class SearchArgs {

  constructor(text: string = '') {
    this.text = text;
    this.attributesAndValues = new Map();
  }


  private text: string;
  private attributesAndValues: Map<string, string[]>;
  private range: number[];

  setText(text: string): void {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }

  addAttribute(name: string, value: string[]): void {
    this.attributesAndValues.set(name, value);
  }

  removeArgument(name: string): void {
    this.attributesAndValues.delete(name);
  }

  getAttributes(): Map<string, string[]> {
    return this.attributesAndValues;
  }

  setRange(range: number[]): void {
    this.range = range;
  }

  getRange(): number[] {
    return this.range;
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

  changeSearchText(text: string = null, attributes: Map<string, string[]> = null, range: number[] = null): void {
    if (text !== null) {
      this.searchArgs.setText(text);
    }

    if (attributes !== null) {
      for (const [key, value] of attributes) {
        this.searchArgs.addAttribute(key, value);
      }
    }

    if (range !== null) {
      this.searchArgs.setRange(range);
    } else {
      this.searchArgs.setRange([]);
    }

    this.searchSubject.next(this.searchArgs);
  }

  removeArgument(name: string) {
    this.searchArgs.removeArgument(name);
  }
}
