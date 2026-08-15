import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PetInterface, PetService } from '../../service/pet';
import { Observable } from 'rxjs';
import { map, finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-pet-form',
  standalone: false,
  templateUrl: './pet-form.html',
  styleUrls: ['./pet-form.css']
})
export class PetForm implements OnInit {
  form!: FormGroup;
  id?: number;
  salvando = false;
  excluindo = false;

  constructor(
    private fb: FormBuilder,
    private petService: PetService,
    private router: Router,
    private route: ActivatedRoute,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      especie: ['', Validators.required],
      idade: [null, [Validators.required, Validators.min(0)]],
      tutor: ['', Validators.required]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : undefined;

    if (this.id) {
      this.petService.getById(this.id).pipe(take(1)).subscribe({
        next: (pet: PetInterface) => this.form.patchValue(pet as Partial<PetInterface>),
        error: (e) => {
          console.error('Erro ao carregar pet', e);
          this.snack.open('Não foi possível carregar o pet.', 'OK', { duration: 4000 });
        }
      });
    }
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snack.open('Preencha os campos obrigatórios.', 'OK', { duration: 3000 });
      return;
    }
    if (this.salvando) return;

    this.salvando = true;

    const raw = this.form.value;
    const pet: PetInterface = {
      ...raw,
      idade: raw.idade !== null && raw.idade !== undefined ? Number(raw.idade) : 0
    };

    // Normaliza para Observable<void> e evita união de tipos
    const req$: Observable<void> = this.id
      ? this.petService.update(this.id, pet)
      : this.petService.create(pet).pipe(map(() => void 0));

    req$.pipe(
      take(1),
      finalize(() => (this.salvando = false))
    ).subscribe({
      next: () => {
        this.snack.open('Salvo com sucesso!', 'OK', { duration: 2000 });
        if (!this.id) this.form.reset();
        this.router.navigateByUrl('/'); // ajuste para '/pets' se sua lista estiver lá
      },
      error: (e) => {
        console.error('Erro ao salvar', e);
        const msg = e?.error?.message || e?.message || 'Não foi possível salvar. Verifique os dados e o servidor.';
        this.snack.open(msg, 'OK', { duration: 5000 });
      }
    });
  }

  excluir(): void {
    if (!this.id || this.excluindo) return;

    const ok = window.confirm('Tem certeza que deseja excluir este pet?');
    if (!ok) return;

    this.excluindo = true;

    this.petService.delete(this.id).pipe(
      take(1),
      finalize(() => (this.excluindo = false))
    ).subscribe({
      next: () => {
        this.snack.open('Excluído com sucesso!', 'OK', { duration: 2000 });
        // força recarregar a lista ao navegar (mude '/' para '/pets' se necessário)
        this.router.navigate(['/'], { queryParams: { _r: Date.now() } });
      },
      error: (e) => {
        console.error('Erro ao excluir', e);
        const msg = e?.error?.message || e?.message || 'Não foi possível excluir.';
        this.snack.open(msg, 'OK', { duration: 5000 });
      }
    });
  }
}
