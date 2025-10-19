import { Routes } from '@angular/router';
import { CarDetailsComponent } from './car-details/car-details.component';
import { CarListComponent } from './car-list/car-list.component';
import { CompareListComponent } from './compare-list/compare-list.component';
import { SearchComponent } from './search/search.component';

export const APP_ROUTES: Routes = [
  { path: '', redirectTo: '/cars', pathMatch: 'full' },
  { path: 'cars', component: CarListComponent },
  { path: 'cars/:id', component: CarDetailsComponent },
  { path: 'cars/compare/:ids', component: CompareListComponent },
  { path: 'search', component: SearchComponent },
];
