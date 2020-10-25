import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Car } from '../car';
import { CarCompareService } from '../car-compare.service';

@Component({
  selector: 'app-compare-bar',
  templateUrl: './compare-bar.component.html',
  styleUrls: ['./compare-bar.component.scss']
})
export class CompareBarComponent implements OnInit {

  constructor(
    private carCompareService: CarCompareService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  getCars(): Car[] {
    return this.carCompareService.comparingCars;
  }

  getCarsIds(): number[] {
    return this.getCars().map(car => car.adac_id);
  }

  onCompare(): void {
    const ids = this.getCarsIds().join(',');
    this.router.navigateByUrl(`/cars/compare/${ids}`);
  }

}
