
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Car } from '../car';
import { CarService } from '../car.service';

@Component({
  selector: 'app-car-details',
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss']
})
export class CarDetailsComponent implements OnInit {
  @Input('car-id')
  carId: number;

  car: Car;
  displayedColumns: string[] = ['name', 'value'];
  dataSource = [];

  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
  ) { }

  getCar(): void {
    this.carId = +(this.carId || this.route.snapshot.paramMap.get('id'));
    this.carService.getCar(this.carId).subscribe(car => {
      this.dataSource = car.attributes;
      this.car = car;
    });
  }

  ngOnInit(): void {
    this.getCar();
  }

}
