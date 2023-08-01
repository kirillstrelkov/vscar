import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  subject: Subject<any> = new Subject();
  version: string = "";

  constructor(
    private searchService: SearchService,
    private carService: CarService,

  ) { }

  ngOnInit(): void {
    this.subject
      .pipe(debounceTime(500))
      .subscribe((value: string) => {
        this.searchService.changeSearchText(value);
      }
      );
    this.carService.getVersion().subscribe((version: any) => {
      this.version = version;
    });
  }

  onSearchType(event: any): void {
    this.subject.next(event.target.value);
  }
}
