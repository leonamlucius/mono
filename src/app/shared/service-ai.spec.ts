import { TestBed } from '@angular/core/testing';

import { ServiceAi } from './service-ai';

describe('ServiceAi', () => {
  let service: ServiceAi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceAi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
