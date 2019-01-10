import { TestBed } from '@angular/core/testing';

import { RicoService } from './rico-angular.service';

describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RicoService = TestBed.get(RicoService);
    expect(service).toBeTruthy();
  });

});
