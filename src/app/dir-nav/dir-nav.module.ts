import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirNavService } from './services/dir-nav/dir-nav.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HighlightSyntaxDirective } from './directives/highlight-syntax/highlight-syntax.directive';

@NgModule({
  imports: [
    CommonModule,
	FormsModule,
	ReactiveFormsModule,
	FlexLayoutModule
  ],
  declarations: [NavbarComponent, HighlightSyntaxDirective],
  providers: [DirNavService],
  exports: [NavbarComponent, HighlightSyntaxDirective]
})
export class DirNavModule { }
