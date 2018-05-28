import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { FormBuilder, FormControl } from '@angular/forms';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

	constructor() {	}

	ngOnInit() {

	}


}
