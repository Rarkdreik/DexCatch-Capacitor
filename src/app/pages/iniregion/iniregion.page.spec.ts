import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IniregionPage } from './iniregion.page';

describe('IniregionPage', () => {
  let component: IniregionPage;
  let fixture: ComponentFixture<IniregionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IniregionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
