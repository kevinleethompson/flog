import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { DirNavService } from '../../services/dir-nav/dir-nav.service';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
	private pathControl: FormControl;

	constructor(private fb: FormBuilder, private navService: DirNavService) { }

	ngOnInit() {
		this.pathControl = this.fb.control([""]);
	}

	navigate(path: string): void { console.log(path); this.navService.chDir(path); }

}
