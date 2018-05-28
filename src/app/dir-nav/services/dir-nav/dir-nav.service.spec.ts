import { TestBed, inject } from '@angular/core/testing';

import { DirNavService } from './dir-nav.service';

describe('DirNavService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DirNavService]
    });
  });

  it('should be created', inject([DirNavService], (service: DirNavService) => {
    expect(service).toBeTruthy();
  }));
});
