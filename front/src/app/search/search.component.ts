import { Component, OnInit } from '@angular/core';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(
    private searchService: SearchService,
  ) { }

  ngOnInit(): void {
  }

  onSearchType(event: any): void {
    // TODO: check for performance
    this.searchService.changeSearchText(event.target.value);
  }
}
