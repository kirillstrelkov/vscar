import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Car } from '../car';
import { CarCompareService } from '../car-compare.service';
import { CarService } from '../car.service';
import { SearchArgs, SearchService } from '../search.service';
import { MatSliderModule } from '@angular/material/slider'; // Import Module for MatSlider
import { MatFormFieldModule } from '@angular/material/form-field'; // Import Module for MatFormField/MatLabel
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select'; // MatSelect often bundles MatOption
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import {
  MatDrawerContent,
  MatSidenav,
  MatSidenavModule,
} from '@angular/material/sidenav';
import { SearchComponent } from '../search/search.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { CompareListComponent } from '../compare-list/compare-list.component';
import { CompareBarComponent } from '../compare-bar/compare-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

// TODO: fix too many requestings

@Component({
  selector: 'app-car-list',
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
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatListModule,
    MatExpansionModule,
    CompareBarComponent,
    MatPaginatorModule,
    MatButtonModule,
    MatTooltipModule,
    CommonModule,
  ],
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss'],
})
export class CarListComponent implements AfterViewInit {
  isLoadingResults = false;
  pageSize = 5;
  resultsLength = 0;
  private searchArgs = new SearchArgs();
  isMobile = false;

  displayedColumns: string[] = [
    'name',
    'transmission',
    'fuel',
    'power',
    'price',
    'actions',
  ];
  data: Car[] = [];
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private carService: CarService,
    private searchService: SearchService,
    private carCompareService: CarCompareService,
    private snackBar: MatSnackBar
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // TODO: check if implementation can be improved
  ngAfterViewInit(): void {
    this.searchService.searchArgsOb.subscribe((args) => {
      this.paginator.pageIndex = 0;
      this.searchArgs = args;
      this.loadData();
    });

    this.isMobile = window.screen.width < 600;
    if (this.isMobile) {
      this.displayedColumns = ['name', 'actions'];
    }
  }

  private loadData(): void {
    this.isLoadingResults = true;
    this.cdr.detectChanges();

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.carService.getCars(
            this.paginator.pageIndex,
            this.paginator.pageSize,
            this.searchArgs.getText(),
            this.searchArgs.getAttributes(),
            this.searchArgs.getRanges()
          );
        }),
        map((data) => {
          this.resultsLength = data['total'];
          return data['docs'];
        }),
        catchError(() => {
          console.log('Error to fetch data');
          return of<Car[]>([]);
        })
      )
      .subscribe((data) => {
        this.data = data;
        this.isLoadingResults = false;
        this.cdr.detectChanges();
        if (data === undefined || data.length === 0) {
          this.openSnackBar();
        }
      });
  }

  openSnackBar(): void {
    this.snackBar.open('No data was found', 'Okay..(', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 2000,
    });
  }

  onCompare(car: Car): void {
    if (this.isComparing(car)) {
      this.carCompareService.remove(car);
    } else {
      this.carCompareService.add(car);
    }
  }

  isComparing(car: Car): boolean {
    return this.carCompareService.contains(car);
  }
}
