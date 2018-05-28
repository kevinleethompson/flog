import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirNavService } from './services/dir-nav/dir-nav.service';

@NgModule({
  imports: [
    CommonModule,
	FormsModule,
	ReactiveFormsModule
  ],
  declarations: [NavbarComponent],
  providers: [DirNavService],
  exports: [NavbarComponent]
})
export class DirNavModule { }
