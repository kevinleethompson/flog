import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ElectronService } from '../../../providers/electron.service';

@Injectable({
	providedIn: 'root'
})
export class DirNavService {
	private fs: any;
	private currDir: Subject<string> = new BehaviorSubject(".");
	private dirContents: Subject<Object[]> = new BehaviorSubject([]);
	get cwd() { return this.currDir.asObservable(); }
	get contents(): Observable<Object[]> { return this.dirContents.asObservable(); }

	constructor(private electronService: ElectronService) {
		this.fs = electronService.fs;
		this.init();
	}

	private init(): void {
		this.cwd.subscribe(
			d => { console.log(d); this.readDir(d); },
			err => { console.log(`err: ${err}`); }
		);
	}

	public chDir(path: string): void {
		console.log(path);
		this.currDir.next(path);
	}

	private readDir(path: string): void {
		try {
			const files = this.fs.readdirSync(path).map(f => {
				const stats = this.fs.statSync(path + "/" + f);
				return {name: f, isHidden: f.startsWith("."), isDir: stats.isDirectory(), isFile: stats.isFile(), size: stats.size};
			});
			this.dirContents.next(files);
		} catch(err) {
			this.dirContents.next(err);
		}
	}


}
