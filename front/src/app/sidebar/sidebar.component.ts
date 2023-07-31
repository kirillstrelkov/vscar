import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';
import { SidebarService } from '../sidebar.service';

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
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  // TODO: side bar should overflow when toggled - only on mobile

  @ViewChild('drawer') sidenav: MatSidenav;

  filters: AttributeFilter[] = [];
  subject: Subject<any> = new Subject();

  constructor(
    private carService: CarService,
    private searchService: SearchService,
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this.sidebarService.sidebarOb.subscribe(() => {
      this.sidenav.toggle();
    });

    this.subject
      .pipe(debounceTime(500))
      .subscribe((filter: AttributeFilter) => {
        this.search(filter);
      }
      );
  }

  addFilter(): void {
    const filter = new AttributeFilter('Attribute name');

    filter.observable.subscribe(text => {
      this.carService.getAttributes(text).subscribe(a => filter.nameOptions = a);
    });

    this.filters.push(filter);
  }

  removeFilter(filter: AttributeFilter): void {
    this.searchService.removeArgument(filter.name);
    this.filters.splice(this.filters.indexOf(filter), 1);
    this.searchService.changeSearchText();
  }

  onSearch(event: any, filter: AttributeFilter): void {
    filter.subject.next(event.target.value);
  }

  onAttrNameChange(attrName: string, filter: AttributeFilter): void {
    filter.status = 'Loading...';
    filter.name = attrName;
    filter.isReady = true;
    this.carService.getAttributeValues(attrName).subscribe(attrs => {
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

  onRangeChange(event: any, filter: AttributeFilter): void {
    let value = event.target.valueAsNumber;
    if (filter.min <= value && value <= filter.max) {
      const isRight = event.target.className.indexOf("slider-right") !== -1;

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

  onChangeUseRange(event: any, filter: AttributeFilter): void {
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
