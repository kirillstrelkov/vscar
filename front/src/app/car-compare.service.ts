import { Injectable } from '@angular/core';
import { Car } from './car';

@Injectable({
  providedIn: 'root',
})
export class CarCompareService {
  // TODO: improve - speedup?
  comparingCars: Car[] = [];
  comparingCarIds: number[] = [];

  add(car: Car): void {
    if (!this.contains(car)) {
      this.comparingCars.push(car);
      this.comparingCarIds.push(car.adac_id);
    }
  }

  remove(car: Car): void {
    if (this.contains(car)) {
      const index = this.carIndex(car);
      this.comparingCarIds.splice(index, 1);
      this.comparingCars.splice(index, 1);
    }
  }

  contains(car: Car): boolean {
    return this.carIndex(car) !== -1;
  }

  private carIndex(car: Car): number {
    return this.comparingCarIds.indexOf(car.adac_id, 0);
  }
}
