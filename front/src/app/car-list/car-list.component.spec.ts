import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarCompareService } from '../car-compare.service';
import { SearchService } from '../search.service';
import { CarService } from '../car.service';

import { CarListComponent } from './car-list.component';

describe('CarListComponent', () => {
  let component: CarListComponent;
  let fixture: ComponentFixture<CarListComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CarService');
    fixture = TestBed.createComponent(CarListComponent);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: CarService, useValue: spy }, SearchService, CarCompareService]
    });

    // Inject the http service and test controller for each test
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);

    // TODO: fixme -   NullInjectorError: No provider for HttpClient!

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
