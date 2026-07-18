import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ItemInterface } from 'src/app/model/Item';

@Component({
  selector: 'app-items-modal',
  templateUrl: './items-modal.component.html',
  styleUrls: ['./items-modal.component.scss'],
})
export class ItemsModalComponent implements OnInit {
  @Input() item!: ItemInterface;

  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  public close(): Promise<boolean> {
    return this.modalController.dismiss();
  }
}
