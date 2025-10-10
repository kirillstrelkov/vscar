import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../sidebar.service';
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
import { AppComponent } from '../app.component';
import { SearchComponent } from '../search/search.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-nav-bar',
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
    SearchComponent,
    MatButtonModule,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavBarComponent implements OnInit {
  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {}

  toggleSidenav(): void {
    this.sidebarService.toggle();
  }
}
