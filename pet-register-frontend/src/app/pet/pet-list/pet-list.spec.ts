import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PetList } from './pet-list';

describe('PetList', () => {
  let component: PetList;
  let fixture: ComponentFixture<PetList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PetList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PetList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
