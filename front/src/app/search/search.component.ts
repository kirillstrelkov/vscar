import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  subject: Subject<any> = new Subject();

  constructor(
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
    this.subject
      .pipe(debounceTime(500))
      .subscribe((value: string) => {
        this.searchService.changeSearchText(value);
      }
      );
  }

  onSearchType(event: any): void {
    this.subject.next(event.target.value);
  }
}
