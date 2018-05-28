import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentsListComponent } from './components/contents-list/contents-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
	imports: [
		FlexLayoutModule,
		CommonModule
	],
	declarations: [ContentsListComponent],
	exports: [ContentsListComponent]

})
export class DirContentsModule { }
