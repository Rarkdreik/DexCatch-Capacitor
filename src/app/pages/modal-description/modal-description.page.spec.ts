import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDescriptionPage } from './modal-description.page';

describe('ModalDescriptionPage', () => {
  let component: ModalDescriptionPage;
  let fixture: ComponentFixture<ModalDescriptionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalDescriptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
