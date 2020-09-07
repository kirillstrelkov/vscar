import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarDetailsComponent } from './car-details/car-details.component';
import { CarListComponent } from './car-list/car-list.component';
import { CompareListComponent } from './compare-list/compare-list.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: 'cars', component: CarListComponent },
  { path: 'cars/:id', component: CarDetailsComponent },
  { path: 'cars/compare/:ids', component: CompareListComponent },
  { path: 'search', component: SearchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
