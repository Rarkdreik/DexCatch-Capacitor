import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PokeCenterPage } from './poke-center.page';

describe('PokeCenterPage', () => {
  let component: PokeCenterPage;
  let fixture: ComponentFixture<PokeCenterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PokeCenterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
