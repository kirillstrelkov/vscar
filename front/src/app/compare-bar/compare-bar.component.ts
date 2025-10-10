import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Car } from '../car';
import { CarCompareService } from '../car-compare.service';
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
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-compare-bar',
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
    CommonModule,
    MatButtonModule,
  ],
  templateUrl: './compare-bar.component.html',
  styleUrls: ['./compare-bar.component.scss'],
})
export class CompareBarComponent implements OnInit {
  constructor(
    private carCompareService: CarCompareService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  getCars(): Car[] {
    return this.carCompareService.comparingCars;
  }

  getCarsIds(): number[] {
    return this.getCars().map((car) => car.adac_id);
  }

  onCompare(): void {
    const ids = this.getCarsIds().join(',');
    this.router.navigateByUrl(`/cars/compare/${ids}`);
  }

  removeCar(car: Car): void {
    this.carCompareService.remove(car);
  }
}
