import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BehaviorSubject, Observable } from 'rxjs';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';
import { SidebarService } from '../sidebar.service';


// TODO: come up with better names
export class AttributeFilter {
  constructor(name: string) {
    this.name = name;
    this.nameOptions = [];
    this.valueOptions = [];
    this.status = '';

    this.subject = new BehaviorSubject(this.name);
    this.observable = this.subject.asObservable();
  }

  name: string;
  nameOptions: string[];
  valueOptions: string[];
  status: string;
  isReady = false;

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

  constructor(
    private carService: CarService,
    private searchService: SearchService,
    private sidebarService: SidebarService
  ) { }

  ngOnInit(): void {
    this.sidebarService.sidebarOb.subscribe(() => {
      this.sidenav.toggle();
    });
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
    this.searchService.changeSearchText(null, null);
  }

  onSearch(event: any, filter: AttributeFilter): void {
    filter.subject.next(event.target.value);
  }

  onAttrNameChange(attrName: string, filter: AttributeFilter): void {
    filter.status = 'Loading...';
    filter.name = attrName;
    filter.isReady = true;
    this.carService.getAttributeValues(attrName).subscribe(a => {
      filter.valueOptions = a;
      filter.status = filter.name;
    });
  }

  onChange(value: any, attrName: string): void {
    const args = new Map();
    args.set(attrName, value);
    this.searchService.changeSearchText(null, args);
  }
}
