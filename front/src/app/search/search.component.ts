import { Component, inject, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';
import { MatSliderModule } from '@angular/material/slider'; // Import Module for MatSlider
import { MatFormFieldModule } from '@angular/material/form-field'; // Import Module for MatFormField/MatLabel
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select'; // MatSelect often bundles MatOption
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-search',
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
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  subject = new Subject<string>();
  version = '';
  private searchService = inject(SearchService);
  private carService = inject(CarService);

  ngOnInit(): void {
    this.subject.pipe(debounceTime(500)).subscribe((value: string) => {
      this.searchService.changeSearchText(value);
    });
    this.carService.getVersion().subscribe((version: string) => {
      this.version = version;
    });
  }

  onSearchType(event: Event): void {
    this.subject.next((event.target as HTMLInputElement).value);
  }
}
