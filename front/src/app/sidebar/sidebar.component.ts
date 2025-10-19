import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';
import { SidebarService } from '../sidebar.service';
import { MatSliderModule } from '@angular/material/slider'; // Import Module for MatSlider
import { MatFormFieldModule } from '@angular/material/form-field'; // Import Module for MatFormField/MatLabel
import { MatIconModule } from '@angular/material/icon';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select'; // MatSelect often bundles MatOption
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

// TODO: come up with better names
export class AttributeFilter {
  constructor(name: string) {
    this.name = name;
    this.nameOptions = [];
    this.valueOptions = [];
    this.selected = [];
    this.status = '';
    this.min = 0;
    this.max = 0;
    this.currentMin = 0;
    this.currentMax = 0;

    this.subject = new BehaviorSubject(this.name);
    this.observable = this.subject.asObservable();
  }

  name: string;
  nameOptions: string[];
  valueOptions: string[];
  selected: string[];
  status: string;
  isReady = false;
  isNumeric = false;
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  useRange = false;

  // TODO: check implementation
  subject: BehaviorSubject<string>;
  observable: Observable<string>;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    MatAutocompleteModule,
    RouterModule,
    MatSidenavModule,
    MatSliderModule,
    MatFormFieldModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  // TODO: side bar should overflow when toggled - only on mobile
  private carService = inject(CarService);
  private searchService = inject(SearchService);
  private sidebarService = inject(SidebarService);

  @ViewChild('drawer') sidenav: MatSidenav;

  filters: AttributeFilter[] = [];
  subject = new Subject<AttributeFilter>();

  ngOnInit(): void {
    this.sidebarService.sidebarOb.subscribe(() => {
      this.sidenav.toggle();
    });

    this.subject
      .pipe(debounceTime(500))
      .subscribe((filter: AttributeFilter) => {
        this.search(filter);
      });
  }

  addFilter(): void {
    const filter = new AttributeFilter('Attribute name');

    filter.observable.subscribe((text) => {
      this.carService
        .getAttributes(text)
        .subscribe((a) => (filter.nameOptions = a));
    });

    this.filters.push(filter);
  }

  removeFilter(filter: AttributeFilter): void {
    this.searchService.removeArgument(filter.name);
    this.filters.splice(this.filters.indexOf(filter), 1);
    this.searchService.changeSearchText();
  }

  onSearch(event: Event, filter: AttributeFilter): void {
    filter.subject.next((event.target as HTMLInputElement).value);
  }

  onAttrNameChange(attrName: string, filter: AttributeFilter): void {
    filter.status = 'Loading...';
    filter.name = attrName;
    filter.isReady = true;
    this.carService.getAttributeValues(attrName).subscribe((attrs) => {
      filter.isNumeric = !Array.isArray(attrs);

      if (filter.isNumeric) {
        filter.valueOptions = attrs['additional_values'];
        filter.min = attrs['range']['min'];
        filter.max = attrs['range']['max'];
        filter.currentMin = filter.min;
        filter.currentMax = filter.max;
      } else {
        filter.valueOptions = attrs;
      }
      filter.status = filter.name;
    });
  }

  onChange(values: string[], filter: AttributeFilter): void {
    filter.selected = values;
    this.subject.next(filter);
  }

  onRangeChange(event: Event, filter: AttributeFilter): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (filter.min <= value && value <= filter.max) {
      const isRight =
        (event.target as HTMLElement).className.indexOf('slider-right') !== -1;

      if (isRight) {
        filter.currentMax = value;
      } else {
        filter.currentMin = value;
      }

      if (filter.useRange) {
        this.subject.next(filter);
      }
    }
  }

  onChangeUseRange(event: MatCheckboxChange, filter: AttributeFilter): void {
    filter.useRange = event.checked;
    this.subject.next(filter);
  }

  search(filter: AttributeFilter): void {
    const attributes = new Map();
    attributes.set(filter.name, filter.selected);

    const ranges = new Map();
    if (filter.useRange) {
      ranges.set(filter.name, [filter.currentMin, filter.currentMax]);
    } else {
      this.searchService.removeRange(filter.name);
    }

    this.searchService.changeSearchText(null, attributes, ranges);
  }
}
