import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Car } from '../car';
import { CarCompareService } from '../car-compare.service';
import { CarService } from '../car.service';
import { SearchService } from '../search.service';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements AfterViewInit {
  isLoadingResults = false;
  pageSize = 5;
  resultsLength = 0;
  private searchText = '';

  displayedColumns: string[] = ['name', 'transmission', 'fuel', 'power', 'price', 'actions'];
  data: Car[] = [];

  constructor(
    private carService: CarService,
    private searchService: SearchService,
    private carCompareService: CarCompareService,
    private snackBar: MatSnackBar,
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // TODO: check if implementation can be improved
  ngAfterViewInit(): void {
    this.searchService.searchText.subscribe(text => {
      this.paginator.pageIndex = 0;
      this.searchText = text;
      this.loadData();
    });
    this.loadData();
  }

  private loadData(): void {
    this.isLoadingResults = true;

    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.carService.getCars(this.paginator.pageIndex, this.paginator.pageSize, this.searchText);
        }),
        map(data => {
          this.resultsLength = data['total'];
          return data['docs'];
        }),
        catchError(() => {
          console.log('Error to fetch data');
          return of<Car[]>([]);
        })
      ).subscribe(data => {
        this.data = data;
        this.isLoadingResults = false;
        if (data.length === 0) {
          this.openSnackBar();
        }
      });
  }

  openSnackBar(): void {
    this.snackBar.open('No data was found', 'Okay..(', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
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
