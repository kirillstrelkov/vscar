import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Car } from '../car';
import { CarService } from '../car.service';
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-car-details',
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
    MatPaginatorModule,
    MatButtonModule,
    MatTooltipModule,
    MatCardModule,
    CommonModule,
  ],
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss'],
})
export class CarDetailsComponent implements OnInit {
  @Input('car-id')
  carId: number;

  car: Car;
  displayedColumns: string[] = ['name', 'value'];
  dataSource = [];

  constructor(private carService: CarService, private route: ActivatedRoute) {}

  getCar(): void {
    this.carId = +(this.carId || this.route.snapshot.paramMap.get('id'));
    this.carService.getCar(this.carId).subscribe((car) => {
      // TODO: move filtering to backend
      this.dataSource = car.attributes;
      this.car = car;
    });
  }

  ngOnInit(): void {
    this.getCar();
  }
}
