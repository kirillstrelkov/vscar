import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Car } from './car';

@Injectable({ providedIn: 'root' })
export class CarService {
  private carUrl = environment.apiURI;

  constructor(private http: HttpClient) { }

  getCar(id: number): Observable<Car> {
    return this.http
      .get<Car>(this.carUrl + '/' + id)
      .pipe(catchError(this.handleError<Car>('getCar', null)));
  }

  getCars(
    page: number = 0,
    limit: number = 100,
    text: string = '',
    attributes: Map<string, string[]> = null,
    ranges: Map<string, number[]> = null
  ): Observable<{}> {
    let jsonRequest = {
      page: page + 1,
      limit: limit,
      text: text,
      attributes: [],
    };

    const url = this.carUrl + '/findByFilter';

    if (attributes !== null) {
      for (const [attrName, attrValues] of attributes) {
        let attrData = {
          name: attrName,
          values: [],
          range: {},
        };
        for (const attrValue of attrValues) {
          attrData.values.push(attrValue);
        }
        if (ranges.has(attrName)) {
          let range = ranges.get(attrName);
          attrData.range = { min: range[0], max: range[1] };
        }
        jsonRequest.attributes.push(attrData);
      }
    }

    return this.http
      .post<{}>(url, jsonRequest)
      .pipe(catchError(this.handleError<{}>('getCars', {})));
  }

  getAttributes(text: string = ''): Observable<[]> {
    return this.http
      .get<[]>(
        this.carUrl + `/attributes/names?text=${encodeURIComponent(text)}`
      )
      .pipe(catchError(this.handleError<[]>('getAttributes', [])));
  }

  getAttributeValues(text: string = ''): Observable<[]> {
    return this.http
      .get<[]>(
        this.carUrl + `/attributes/values?text=${encodeURIComponent(text)}`
      )
      .pipe(catchError(this.handleError<[]>('getAttributeValues', [])));
  }

  getVersion(): Observable<string> {
    return this.http
      .get(this.carUrl + '/db/version', { responseType: 'text' })
      .pipe(catchError(this.handleError<string>('getVersion', null)));

  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
