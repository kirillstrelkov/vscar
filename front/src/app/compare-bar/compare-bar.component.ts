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

  getCars(): number[] {
    return this.carCompareService.comparingCarsIds;
  }

  onCompare() {
    const ids = this.getCars().join(',');
    this.router.navigateByUrl(`/cars/compare/${ids}`);
  }

}
