import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSeparatorComponent } from './filter-separator-component';

describe('FilterSeparatorComponent', () => {
  let component: FilterSeparatorComponent;
  let fixture: ComponentFixture<FilterSeparatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterSeparatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSeparatorComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
