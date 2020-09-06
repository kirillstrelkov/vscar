import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Car } from './car';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CarService {
  private carUrl = 'http://localhost:3000/cars';


  constructor(private http: HttpClient) { }

  getCar(id: number) {
    return this.http.get<Car>(this.carUrl + '/' + id).pipe(
      catchError(this.handleError<Car>('getCar', null))
    );
  }

  getCars(page: number = 0, limit: number = 100): Observable<Car[]> {
    return this.http.get<Car[]>(this.carUrl + `/findByFilter?page=${page + 1}&limit=${limit}`).pipe(
      catchError(this.handleError<Car[]>('getCars', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error); // log to console instead
      return of(result as T);
    };
  }
}
