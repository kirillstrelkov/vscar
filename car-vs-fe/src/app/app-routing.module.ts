import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CarDetailsComponent } from './car-details/car-details.component';
import { CarListComponentComponent } from './car-list-component/car-list-component.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  { path: 'cars', component: CarListComponentComponent },
  { path: 'cars/:id', component: CarDetailsComponent },
  // { path: 'car-details', component: CarDetailsComponent },
  { path: 'search', component: SearchComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
