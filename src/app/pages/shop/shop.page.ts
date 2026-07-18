import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/services/firebase.service';
import { RepositoryService } from 'src/app/services/repository.service';
import { ItemInterface } from 'src/app/model/Item';
import { ItemService } from 'src/app/services/item.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.page.html',
  styleUrls: ['./shop.page.scss'],
})
export class ShopPage implements OnInit {
  selectedCartIndex: any = null;
  selectedShopIndex: any = null;
  cart:       any[] = [];
  items_shop: ItemInterface[] = [];
  total:   number = 0.00;
  myMoney: number = 0.00;
  myCost:  number = 0.00;
  totalTotal: string = '0.00 €';
  totalMoney: string = '0.00 €';
  totalCost:  string = '0.00 €';

  constructor(public router: Router, public fire: FirebaseService, public repo: RepositoryService, private itemService: ItemService) {
    
    for (let i = 0; i < 6; i++) {
      //let anyItem: any = { name: 'Potion', img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${i+1}.png` };
      this.cart.push(null);
    }

    // for (let i = 10; i < 27; i++) {
    //   let anyItem: any = null;
    //   this.items_shop.push(anyItem);
    // }
    this.syncMasterShopState();
  }

  async ngOnInit() {
    // EVOLUTION
    // https://pokeapi.co/api/v2/item-category/10/
    // https://pokeapi.co/api/v2/item-category/12/

    // HELP
    // https://pokeapi.co/api/v2/item-category/27/

    // BALLS
    // https://pokeapi.co/api/v2/item-category/33/
    // https://pokeapi.co/api/v2/item-category/34/

    const evolutionCategoryUrlv1 = 'https://pokeapi.co/api/v2/item-category/10/';
    const evolutionCategoryUrlv2 = 'https://pokeapi.co/api/v2/item-category/12/';
    const helpCategoryUrl = 'https://pokeapi.co/api/v2/item-category/27/';
    const ballsCategoryUrlv1 = 'https://pokeapi.co/api/v2/item-category/33/';
    const ballsCategoryUrlv2 = 'https://pokeapi.co/api/v2/item-category/34/';

    await this.fetchItemData(evolutionCategoryUrlv1, "es");
    await this.fetchItemData(evolutionCategoryUrlv2, "es");
    await this.fetchItemData(helpCategoryUrl, "es");
    //await this.fetchItemData(ballsCategoryUrlv1, "es");
    await this.fetchItemData(ballsCategoryUrlv2, "es");
  }

  public goMain() {
    setTimeout(() => { this.router.navigate(['/home'], { replaceUrl: true }); }, 900);
  }

  selectCartItem(index: number) {
    if (!this.cart[index]) {
      return;
    }

    this.cart[index].count--;

    if (this.cart[index].count <= 0) {
      this.cart[index] = null;
    }

    if (this.selectedCartIndex === index) {
      this.selectedCartIndex = this.selectedCartIndex;
    } else {
      this.selectedCartIndex = index;
      setTimeout(() => { this.selectedCartIndex = null; }, 1500);
    }

    this.getTotalCost();
  }

  selectShopItem(index: number) {
    let firstNullIndex = -1;
    let itemAlreadyExists = false;
    const itemName = this.items_shop[index].name;

    for (let i = 0; i < this.cart.length; i++) {
      if (this.cart[i] === null) {
        firstNullIndex = i;
        break;
      }
    }

    for (let i = 0; i < this.cart.length; i++) {
      if (this.cart[i] && this.cart[i].name === itemName) {
        firstNullIndex = i;
        itemAlreadyExists = true;
        break;
      }
    }

    if (itemAlreadyExists || firstNullIndex !== -1) {
      let auxCost = this.myCost;
      let auxMoney = this.myMoney;

      if (itemAlreadyExists) {
        auxCost -= Number(this.cart[firstNullIndex].cost) || 0;
      } else if (firstNullIndex !== -1) {
        auxCost -= Number(this.items_shop[index].cost) || 0;
      }

      console.log(`2 auxCost=${auxCost}, auxMoney=${auxMoney}`);

      if (Math.abs(auxCost) > auxMoney)
        alert('Cannot add more items to the cart. You do not have enough money.');
      else {

        if (itemAlreadyExists) {
          this.cart[firstNullIndex].count++;

          if (this.cart[firstNullIndex].count >= 99)
            this.cart[firstNullIndex].count = 99;
        } else if (firstNullIndex !== -1) {
          this.cart[firstNullIndex] = { ...this.items_shop[index] };
        }

      }
    } else {
      alert('Cannot add more items to the cart. The cart has reached its maximum capacity of 6 items.');
    }

    if (this.selectedShopIndex === index)
      this.selectedShopIndex = this.selectedShopIndex;
    else {
      this.selectedShopIndex = index;

      // Set this.selectedShopIndex to null after 1 second
      setTimeout(() => { this.selectedShopIndex = null; }, 1500);
    }

    // this.swapItems();
    this.getTotalCost();
  }

  public getTotalCost(): void {
    this.myCost = this.cart.reduce((totalCost, item) => {
      if (!item) {
        return totalCost;
      }

      const cost = Number(item.cost) || 0;
      const count = Number(item.count) || 0;
      return totalCost + (cost * -count);
    }, 0);

    this.total = this.myMoney + this.myCost;
    this.totalCost = this.formatCurrency(this.myCost);
    this.totalTotal = this.formatCurrency(this.total);
  }

  public payShopItems() {
    const master = this.repo.getMaster();
    master.items = Array.isArray(master.items) ? master.items : [];

    const anyItems: ItemInterface[] = this.cart.filter((item): item is ItemInterface => item !== null);
    anyItems.forEach(item => { this.itemService.addOrUpdateItem(master.items, item); });

    master.money = this.myMoney - Math.abs(this.myCost);
    this.repo.setMaster(master);
    this.fire.addMaster(master);

    this.router.navigate(['/home'], { replaceUrl: true });;
  }

  private syncMasterShopState(): void {
    const master = this.repo.getMaster();

    if (typeof master.money !== 'number' || Number.isNaN(master.money)) {
      master.money = 1500;
    }

    this.itemService.ensureMasterItems(master);
    this.repo.setMaster(master);

    this.myMoney = master.money;
    this.total = this.myMoney + this.myCost;
    this.totalMoney = this.formatCurrency(this.myMoney);
    this.totalCost = this.formatCurrency(this.myCost);
    this.totalTotal = this.formatCurrency(this.total);
  }

  private formatCurrency(value: number): string {
    return `${(Number(value) || 0).toFixed(2)} €`;
  }
  async releasePokemon() {
  }

  async showPokemonInfo() {
  }

  loadMore(event: any) {
    // Cargar más Items Shop
    event.target.complete();
  }

  private swapItems() {
    // Lógica para asignar un item
    if (this.selectedCartIndex !== null && this.selectedShopIndex !== null) {
      const temp = this.cart[this.selectedCartIndex];
      this.cart[this.selectedCartIndex] = this.items_shop[this.selectedShopIndex];
      this.items_shop[this.selectedShopIndex] = temp;

      this.selectedCartIndex = null;
      this.selectedShopIndex = null;
    }
  }

  async fetchItemData(url: string, lang?: string): Promise<ItemInterface[]> {
    const itemsData = await this.itemService.fetchCategoryItems(url, lang || 'es');

    itemsData.forEach(item => {
      const exists = this.items_shop.some(shopItem => shopItem.name === item.name);

      if (!exists && item.img !== '' && !item.name.toLowerCase().startsWith('la') && !item.name.toLowerCase().startsWith('sport') && item.cost > 0) {
        this.items_shop.push({ ...item });
      }
    });

    return itemsData;
  }

}
