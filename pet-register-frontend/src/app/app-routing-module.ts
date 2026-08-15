import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PetList} from './pet/pet-list/pet-list';
import { PetForm } from './pet/pet-form/pet-form';

const routes: Routes = [
  { path: '', component: PetList },
  { path: 'novo', component: PetForm },
  { path: 'editar/:id', component: PetForm }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}