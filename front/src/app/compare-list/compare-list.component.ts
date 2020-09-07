import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, merge, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CarService } from '../car.service';

@Component({
  selector: 'app-compare-list',
  templateUrl: './compare-list.component.html',
  styleUrls: ['./compare-list.component.scss']
})
export class CompareListComponent implements AfterViewInit {
  ids: string[] = []

  displayedColumns: string[] = [];
  data: Object[] = [];

  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
  ) { }

  // TODO: create table:
  // name, value1, value2, ....
  // name, MB, VW,...
  // image, <>, <>
  // [{'name': 'Getribe', 'car1': 'value'. . .}]
  // name: string;
  // id: string; // TODO: check if id or _id should be here
  // adac_id: number;
  // image: string;
  // processed_date: string;
  // url: string;
  // power: number;
  // transmission: string;
  // fuel: string;
  // price: number;
  // checksum: string;

  ngAfterViewInit() {
    this.ids = this.route.snapshot.paramMap.get('ids').split(',');

    const attrsToSkip = ['checksum'];
    const attrsToAdd = ['name', 'image'];

    this.data = []
    // TODO: fix implmentation use rxJS properly
    forkJoin(...this.ids.map((id) => this.carService.getCar(+id)))
      .subscribe(cars => {
        this.displayedColumns = ['name']
        let newData = []

        for (let car of cars) {
          this.displayedColumns.push(car.name)
        };

        const attrs = attrsToAdd.concat(cars[0].attributes.map((c) => c.name));

        for (let attr of attrs) {
          const isAttrToSkip = attrsToSkip.indexOf(attr) != -1;
          if (isAttrToSkip) {
            continue;
          }
          let cellData = { 'name': { 'value': attr } };
          for (let car of cars) {
            const carName = car.name;

            const isField = attrsToAdd.indexOf(attr) != -1
            if (isField) {
              cellData[carName] = { 'value': car[attr] };
              if (attr == 'name') {
                cellData[carName]['url'] = car.url;
              }
              if (attr == 'image') {
                cellData[carName]['name'] = attr;
              }
            } else {
              for (let car_attr of car.attributes) {
                if (car_attr.name == attr) {
                  cellData[carName] = { 'value': car_attr.value };
                  break;
                }
              }
            }
          };
          // TODO: reorder
          // TODO: add filter for rows with no data
          newData.push(cellData);
        }
        this.data = newData;
      }
      );
  }

}
