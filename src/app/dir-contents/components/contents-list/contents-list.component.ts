import { Component, OnInit } from '@angular/core';
import { DirNavService } from '../../../dir-nav/services/dir-nav/dir-nav.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
	selector: 'app-contents-list',
	templateUrl: './contents-list.component.html',
	styleUrls: ['./contents-list.component.scss']
})
export class ContentsListComponent implements OnInit {
	private files: Object[] = [];

	constructor(private navService: DirNavService) { }

	ngOnInit() {
		this.navService.contents.pipe(
				catchError(err => {console.log(err); return of(err);})
			)
			.subscribe(
				c => { console.log(c); this.files = c; },
				err => { console.log(err); }
			);
	}

}
