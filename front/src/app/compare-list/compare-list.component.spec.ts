import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { CarService } from '../car.service';

import { CompareListComponent } from './compare-list.component';

describe('CompareListComponent', () => {
  let component: CompareListComponent;
  let fixture: ComponentFixture<CompareListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompareListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: convertToParamMap({ ids: '250123,304470' }) }
        },
      }, CarService]

    });

    fixture = TestBed.createComponent(CompareListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
