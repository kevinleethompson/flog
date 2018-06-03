import { Component, OnInit } from '@angular/core';
import { DirNavService } from '../../services/dir-nav/dir-nav.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

	constructor(private navService: DirNavService) { }

	ngOnInit() {

	}

	private navigate(e: Event, path: string): void {
		e.preventDefault();
		if (path.length == 0) return;
		this.navService.chDir(path);
	}

}
