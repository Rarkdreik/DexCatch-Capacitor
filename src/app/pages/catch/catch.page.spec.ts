import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatchPage } from './catch.page';

describe('CatchPage', () => {
  let component: CatchPage;
  let fixture: ComponentFixture<CatchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CatchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
