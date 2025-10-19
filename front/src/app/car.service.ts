import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Car } from './car';

@Injectable({ providedIn: 'root' })
export class CarService {
  private carUrl = environment.apiURI;
  private http = inject(HttpClient);

  getCar(id: number): Observable<Car> {
    return this.http
      .get<Car>(this.carUrl + '/' + id)
      .pipe(catchError(this.handleError<Car>(null)));
  }

  getCars(
    page = 0,
    limit = 100,
    text = '',
    attributes: Map<string, string[]> = null,
    ranges: Map<string, number[]> = null,
  ): Observable<unknown> {
    const jsonRequest = {
      page: page + 1,
      limit: limit,
      text: text,
      attributes: [],
    };

    const url = this.carUrl + '/findByFilter';

    if (attributes !== null) {
      for (const [attrName, attrValues] of attributes) {
        const attrData = {
          name: attrName,
          values: [],
          range: {},
        };
        for (const attrValue of attrValues) {
          attrData.values.push(attrValue);
        }
        if (ranges.has(attrName)) {
          const range = ranges.get(attrName);
          attrData.range = { min: range[0], max: range[1] };
        }
        jsonRequest.attributes.push(attrData);
      }
    }

    return this.http
      .post<unknown>(url, jsonRequest)
      .pipe(catchError(this.handleError<unknown>(null)));
  }

  getAttributes(text = ''): Observable<[]> {
    return this.http
      .get<
        []
      >(this.carUrl + `/attributes/names?text=${encodeURIComponent(text)}`)
      .pipe(catchError(this.handleError<[]>([])));
  }

  getAttributeValues(text = ''): Observable<[]> {
    return this.http
      .get<
        []
      >(this.carUrl + `/attributes/values?text=${encodeURIComponent(text)}`)
      .pipe(catchError(this.handleError<[]>([])));
  }

  getVersion(): Observable<string> {
    return this.http
      .get(this.carUrl + '/db/version', { responseType: 'text' })
      .pipe(catchError(this.handleError<string>(null)));
  }

  private handleError<T>(result?: T) {
    return (error: unknown): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }
}
