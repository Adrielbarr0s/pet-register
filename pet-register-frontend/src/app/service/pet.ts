// src/app/service/pet.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PetInterface {
  id?: number;
  nome: string;
  especie: string;
  idade: number;
  tutor: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'https://pet-register-api.onrender.com/api/pets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PetInterface[]> {
    return this.http.get<PetInterface[]>(this.apiUrl);
  }

  getById(id: number): Observable<PetInterface> {
    return this.http.get<PetInterface>(`${this.apiUrl}/${id}`);
  }

  create(pet: PetInterface): Observable<PetInterface> {
    return this.http.post<PetInterface>(this.apiUrl, pet);
  }

  update(id: number, pet: PetInterface): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, pet);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
