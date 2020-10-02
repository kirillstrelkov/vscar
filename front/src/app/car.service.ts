import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Car } from './car';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
      for (const [attrName, attrValues] of Object.entries(args)) {
        for (const attrValue of attrValues) {
          url += `&${attrName}[]=${attrValue}`;
        }
      }
    }
    // TODO: note max url length is around 65k characters - find better implementation
    return this.http.get<{}>(url).pipe(
      catchError(this.handleError<{}>('getCars', {}))
    );
  }

  getAttributes(text: string = ''): Observable<[]> {
    return this.http.get<[]>(this.carUrl + `/attributes/names?text=${text}`).pipe(
      catchError(this.handleError<[]>('getAttributes', []))
    );
  }

  getAttributeValues(text: string = ''): Observable<[]> {
    return this.http.get<[]>(this.carUrl + `/attributes/values?text=${text}`).pipe(
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
