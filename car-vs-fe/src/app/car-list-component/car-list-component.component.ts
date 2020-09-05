import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Car } from '../car';
import { CarService } from '../car.service';

@Component({
  selector: 'app-car-list-component',
  templateUrl: './car-list-component.component.html',
  styleUrls: ['./car-list-component.component.scss']
})
export class CarListComponentComponent implements AfterViewInit {
  pageSize = 5;
  resultsLength = 100;
  comparingCars = []

  displayedColumns: string[] = ['name', 'fuel', 'power', 'price', 'actions'];
  data: Car[] = [];

  constructor(private carService: CarService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // TODO: fix page and size should be sent

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          return this.carService.getCars(this.paginator.pageIndex);
        }),
        map(data => {
          // TODO: getCars should return {total_count: 1, items:[...]}
          // Otherwise not possible to use pageIndex and limit for request
          // this.resultsLength = data['total_count'];
          // return data['items']
          return data;
        }),
        catchError(() => {
          console.log("Error to fetch data");
          return of<Car[]>([]);
        })
      ).subscribe(data => this.data = data);
  }


  // TODO: should be moved to service
  // TODO: change car to id, compare based on id
  onCompare(car: Car) {
    console.log(car.name);
    if (this.isComparing(car)) {
      this.comparingCars.splice(this.comparingCars.indexOf(car, 0), 1);
    } else {
      this.comparingCars.push(car);
    }
  }

  isComparing(car: Car) {
    return this.comparingCars.indexOf(car, 0) != -1;
  }
}
