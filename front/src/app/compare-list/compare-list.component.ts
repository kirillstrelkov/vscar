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
  ids: string[] = [];

  displayedColumns: string[] = [];
  data: object[] = [];

  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
  ) { }

  // TODO: fix - if cars have same name - doesn't work as displayedColumns have duplicates
  ngAfterViewInit() {
    this.ids = this.route.snapshot.paramMap.get('ids').split(',');

    const attrsToSkip = ['checksum'];
    const attrsToAdd = ['name', 'image'];

    this.data = [];
    // TODO: fix implmentation use rxJS properly
    forkJoin(...this.ids.map((id) => this.carService.getCar(+id)))
      .subscribe(cars => {
        this.displayedColumns = ['name'];
        let newData = [];

        for (const car of cars) {
          this.displayedColumns.push(car.name);
        }

        const attrs = attrsToAdd.concat(cars[0].attributes.map((c) => c.name));

        for (const attr of attrs) {
          const isAttrToSkip = attrsToSkip.indexOf(attr) !== -1;
          if (isAttrToSkip) {
            continue;
          }
          const cellData = { name: { value: attr } };
          for (const car of cars) {
            const carName = car.name;

            const isField = attrsToAdd.indexOf(attr) !== -1;
            if (isField) {
              cellData[carName] = { value: car[attr] };
              if (attr === 'name') {
                cellData[carName].url = car.url;
              }
              if (attr === 'image') {
                cellData[carName].name = attr;
              }
            } else {
              for (const carAttr of car.attributes) {
                if (carAttr.name === attr) {
                  cellData[carName] = { value: carAttr.value };
                  break;
                }
              }
            }
          }
          newData.push(cellData);
        }
        // TODO: reorder ?

        const emptyRows = [];
        // TODO: come up with heat map integration, same values - same color
        for (const row of newData) {
          // 2 = 1 value for attribute name + 1 unique value for all other cars
          if (new Set(['name', 'image']).has(row.name.value)) {
            continue;
          }
          const uniqValues = new Set();
          let lastAttrValue;
          for (const key of Object.keys(row)) {
            const cell = row[key];
            uniqValues.add(cell.value);
            lastAttrValue = cell.value;
          }

          const hasDifferentValues = uniqValues.size !== 2;
          row.name.hasDifferentValues = hasDifferentValues;

          if (!hasDifferentValues && (lastAttrValue == null || lastAttrValue === '')) {
            emptyRows.push(row);
          }
        }

        newData = newData.filter(item => emptyRows.indexOf(item) === -1);

        this.data = newData;
      }
      );
  }
}
