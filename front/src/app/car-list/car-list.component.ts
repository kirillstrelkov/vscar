import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Car } from '../car';
import { CarCompareService } from '../car-compare.service';
import { CarService } from '../car.service';

@Component({
  selector: 'app-car-list',
  templateUrl: './car-list.component.html',
  styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements AfterViewInit {
  pageSize = 5;
  resultsLength = 0;

  displayedColumns: string[] = ['name', 'transmission', 'fuel', 'power', 'price', 'actions'];
  data: Car[] = [];

  constructor(
    private carService: CarService,
    private carCompareService: CarCompareService
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.carService.getCars(this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          this.resultsLength = data.total;
          return data.docs;
        }),
        catchError(() => {
          console.log('Error to fetch data');
          return of<Car[]>([]);
        })
      ).subscribe(data => this.data = data);
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
