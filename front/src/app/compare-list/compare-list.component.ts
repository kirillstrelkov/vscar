import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
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

  readonly attrString = "Attribute";

  constructor(
    private carService: CarService,
    private route: ActivatedRoute,
  ) { }

  // TODO: fix - if cars have same name - doesn't work as displayedColumns have duplicates
  ngAfterViewInit() {
    this.ids = this.route.snapshot.paramMap.get('ids').split(',');

    const attrsToSkip = new Set(['checksum']);
    const attrsToAdd = ['image', 'name'];

    this.data = [];
    // TODO: fix implmentation use rxJS properly
    forkJoin(...this.ids.map((id) => this.carService.getCar(+id)))
      .subscribe(cars => {
        this.displayedColumns = [this.attrString];

        for (const car of cars) {
          this.displayedColumns.push(car.name);
        }

        const attrs = attrsToAdd.concat(cars[0].attributes.map((c) => c.name));
        let newData = [];
        for (const attr of attrs) {
          if (attrsToSkip.has(attr)) {
            continue;
          }

          let rowData = {};
          rowData[this.attrString] = { value: attr };

          /* 
          rowData contains attribute data for cars and attribute name itself, example:
          {
            'Attribute': { value: 'Grundpreis'; },
            'VW Golf': { value: '25000 Euro'; },
            'Audi A1': { value: '30000 Euro'; }
          }
          
          Would be rendered to:
          | Attribute  | VW Golf    | Audi A1     |
          | Grundpreis | 25000 Euro | 30000 Euro  |
          
          NOTE: in some cases contains additional information
          */
          for (const car of cars) {
            const carName = car.name;

            const isField = attrsToAdd.indexOf(attr) !== -1;
            if (isField) {
              rowData[carName] = { value: car[attr] };
              if (attr === 'name') {
                rowData[carName].url = car.url;
              }
              if (attr === 'image') {
                rowData[carName].name = attr;
              }
            } else {
              for (const carAttr of car.attributes) {
                if (carAttr.name === attr) {
                  rowData[carName] = { value: carAttr.value };
                  break;
                }
              }
            }
          }
          newData.push(rowData);
        };
        // TODO: reorder ?


        // Remove empty rows and set difference flag if attributes are different
        const emptyRows = [];
        const nameAndImage = new Set(['name', 'image']);
        // TODO: come up with heat map integration, same values - same color
        for (const row of newData) {
          // 2 = 1 value for attribute name + 1 unique value for all other cars
          if (nameAndImage.has(row[this.attrString].value)) {
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
          row[this.attrString].hasDifferentValues = hasDifferentValues;

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