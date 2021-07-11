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
    return this.http.get<Car>(this.carUrl + '/' + id).pipe(
      catchError(this.handleError<Car>('getCar', null))
    );
  }

  getCars(page: number = 0, limit: number = 100, text: string = '', args: Map<string, string[]> = null): Observable<{}> {
    let url = this.carUrl + `/findByFilter?page=${page + 1}&limit=${limit}&text=${text}`;
    if (args !== null) {
      // TODO: improve
      for (const [attrName, attrValues] of args) {
        for (const attrValue of attrValues) {
          url += `&${encodeURIComponent(attrName)}[]=${encodeURIComponent(attrValue)}`;
        }
      }
    }
    // TODO: note max url length is around 65k characters - find better implementation
    return this.http.get<{}>(url).pipe(
      catchError(this.handleError<{}>('getCars', {}))
    );
  }

  getAttributes(text: string = ''): Observable<[]> {
    return this.http.get<[]>(this.carUrl + `/attributes/names?text=${encodeURIComponent(text)}`).pipe(
      catchError(this.handleError<[]>('getAttributes', []))
    );
  }

  getAttributeValues(text: string = ''): Observable<[]> {
    return this.http.get<[]>(this.carUrl + `/attributes/values?text=${encodeURIComponent(text)}`).pipe(
      catchError(this.handleError<[]>('getAttributeValues', []))
    );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
