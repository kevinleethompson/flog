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

	private fs: any;
	private files: Object[] = [];
	private pathControl: FormControl;

	constructor(private electronService: ElectronService, private fb: FormBuilder) {
		this.fs = electronService.fs;
	}

	ngOnInit() {
		this.files = this.readDir('/home/kthom');
		this.pathControl = this.fb.control([""]);
	}

	public readDir(path: string): Object[] {
		const files = this.fs.readdirSync(path).map(f => {
			const stats = this.fs.statSync(path + "/" + f);
			return {name: f, isHidden: f.startsWith("."), isDir: stats.isDirectory(), isFile: stats.isFile(), size: stats.size};
		});
		return files;
	}

	public changeDir(path: string) {
		this.files = this.readDir(path);
	}

}
