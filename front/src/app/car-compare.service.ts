import { Injectable } from '@angular/core';
import { Car } from './car';

@Injectable({
  providedIn: 'root'
})
export class CarCompareService {
  // TODO: improve?
  comparingCarsIds: number[] = [];

  constructor() { }

  add(car: Car) {
    if (!this.contains(car)) {
      this.comparingCarsIds.push(car.adac_id);
    }
  }
  remove(car: Car) {
    if (this.contains(car)) {
      this.comparingCarsIds.splice(this.comparingCarsIds.indexOf(car.adac_id, 0), 1);
    }
  }

  contains(car: Car) {
    return this.comparingCarsIds.indexOf(car.adac_id, 0) != -1;
  }
}

