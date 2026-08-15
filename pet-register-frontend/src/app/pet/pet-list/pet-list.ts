import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PetInterface, PetService } from '../../service/pet';

@Component({
  selector: 'app-pet-list',
  standalone: false,
  templateUrl: './pet-list.html',
  styleUrl: './pet-list.css'
})
export class PetList implements OnInit {
  pets: PetInterface[] = [];

  constructor(private petService: PetService, private router: Router) {}

  ngOnInit(): void {
    this.carregarPets();
  }

  carregarPets(): void {
    this.petService.getAll().subscribe((data) => {
      this.pets = data;
    });
  }

  editar(id: number): void {
    this.router.navigate(['/editar', id]);
  }

  excluir(id: number): void {
    if (confirm('Tem certeza que deseja excluir este pet?')) {
      this.petService.delete(id).subscribe(() => {
        this.carregarPets();
      });
    }
  }

}
