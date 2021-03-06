import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable } from '@angular/material/table';
import axios, { AxiosResponse } from 'axios';
import { response } from 'express';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  heroes: any[] = [];
  heroesIds: string[] = [];
  lastHeroIds: string[];
  usdRate: number = null;

  displayedColumns: string[] = ['id', 'avatar', 'name', 'created', 'modified', 'price', 'usd', 'battlecap', 'status', 'refresh'];

  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  ngOnInit(): void {
    this.getUsdCurrentRate();
    setInterval(() => { this.call(); }, 1000);
    // this.call();
  }

  async getUsdCurrentRate(): Promise<void> {
    const response: AxiosResponse<any> = await axios.get('https://exchange.thetanarena.com/exchange/v1/currency/price/32');
    if (response.status === 200) {
      if (response.data.success) {
        this.usdRate = response.data.data;
      }
    }
  }

  async call(): Promise<void> {
    const response: AxiosResponse<any> = await axios.get('https://data.thetanarena.com/thetan/v1/nif/search?sort=Latest&priceMin=0&priceMax=13000000&from=0&size=16');
    if (response.status === 200) {
      // response success
      if (response.data.success) {
        const data = response.data.data;
        // console.log(data);
        this.lastHeroIds = [];
        for (let i: number = 0; i < data.length; i += 1) {
          this.lastHeroIds.push(data[i].id);
          if (!this.heroesIds.includes(data[i].id)) {
            this.heroesIds.push(data[i].id);
            const idx: number = this.heroes.findIndex((element: any): boolean => element.refId === data[i].refId);
            if (idx > -1) {
              this.heroes.splice(idx, 1);
            }
            this.heroes.push(data[i]);
          }
        }
        this.heroes.reverse();
        this.table.renderRows();
      }
    }
  }

  getHeroInfo(id: string): void {
    const url: string = `https://data.thetanarena.com/thetan/v1/items/${id}`;
    axios.get(url)
      .then((res: AxiosResponse<any>): void => {
        const data = res.data.data;
        const idx: number = this.heroes.findIndex((element: any): boolean => element.id === id);
        this.heroes[idx].lastModified = data.lastModified;
        this.heroes[idx].price = data.sale.price;
        this.table.renderRows();
      });
  }

  getUsdPrice(wbnb: number): number {
    return (this.usdRate * (wbnb / 100000000));
  }

  isSold(id: string): boolean {
    return !this.lastHeroIds.includes(id);
  }
}


/*
1WBNB = 1^18
3500000000000000000 = 3.5 WBNB
185000000000000000 = 0.185
300000000000000000 = 0.3
26000000000000000 = 0.026
 */
