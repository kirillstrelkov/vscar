import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareBarComponent } from './compare-bar.component';

describe('CompareComponent', () => {
  let component: CompareBarComponent;
  let fixture: ComponentFixture<CompareBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompareBarComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
