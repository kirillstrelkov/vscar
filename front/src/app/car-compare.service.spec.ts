import { TestBed } from '@angular/core/testing';

import { CarCompareService } from './car-compare.service';

describe('CompareService', () => {
  let service: CarCompareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarCompareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
