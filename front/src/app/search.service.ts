import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class SearchArgs {
  constructor(text = '') {
    this.text = text;
    this.attributesAndValues = new Map();
    this.attributesAndRanges = new Map();
  }

  private text: string;
  private attributesAndValues: Map<string, string[]>;
  private attributesAndRanges: Map<string, number[]>;

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
    this.removeRange(name);
  }

  removeRange(name: string): void {
    this.attributesAndRanges.delete(name);
  }

  getAttributes(): Map<string, string[]> {
    return this.attributesAndValues;
  }

  setRange(name: string, range: number[]): void {
    this.attributesAndRanges.set(name, range);
  }

  getRanges(): Map<string, number[]> {
    return this.attributesAndRanges;
  }
}

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private searchArgs = new SearchArgs();
  private searchSubject = new BehaviorSubject<SearchArgs>(this.searchArgs);

  searchArgsOb = this.searchSubject.asObservable();

  changeSearchText(
    text: string = null,
    attributes: Map<string, string[]> = null,
    ranges: Map<string, number[]> = null,
  ): void {
    if (text !== null) {
      this.searchArgs.setText(text);
    }

    if (attributes !== null) {
      for (const [key, value] of attributes) {
        this.searchArgs.addAttribute(key, value);
      }
    }

    if (ranges !== null) {
      for (const [key, value] of ranges) {
        this.searchArgs.setRange(key, value);
      }
    }

    this.searchSubject.next(this.searchArgs);
  }

  removeRange(name: string) {
    this.searchArgs.removeRange(name);
  }

  removeArgument(name: string) {
    this.searchArgs.removeArgument(name);
  }
}
