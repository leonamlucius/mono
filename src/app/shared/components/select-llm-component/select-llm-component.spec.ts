import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectLlmComponent } from './select-llm-component';

describe('SelectLlmComponent', () => {
  let component: SelectLlmComponent;
  let fixture: ComponentFixture<SelectLlmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectLlmComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectLlmComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
