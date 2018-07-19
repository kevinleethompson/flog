import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ElectronService } from '../../../providers/electron.service';
import { ParsedPath } from 'path';

@Injectable({
	providedIn: 'root'
})
export class DirNavService {
	private fs: any;
	private dirSnapshot: string;
	private currDir: Subject<string> = new BehaviorSubject(this._es.path.resolve("."));
	private dirContents: Subject<Object[]> = new BehaviorSubject([]);
	get cwd() { return this.currDir.asObservable(); }
	get contents(): Observable<Object[]> { return this.dirContents.asObservable(); }
	private pathPattern: RegExp = /^([/]?)(((\w|\d)+[-_\s]*)+[/]?)*([\w|\d]+[\.]?[^.$])*$/;

	constructor(private _es: ElectronService) {
		this.fs = _es.fs;
		this.init();
	}

	private init(): void {
		const items = [];
		this.cwd.subscribe(
			d => {
				this.dirSnapshot = d;
				let count = 0;
				this._es.klaw(d, { filter: this.fileAccessFilter.bind(this) })
					.on('readable', function() {
						let item
						count++;
						if (count % 1000 == 0) console.log(`Still working: ${count}`);
						while ((item = this.read())) {
							items.push(item);
						}
					})
					.on('error', (err, item) => {
						count++;
						if (count % 1000 == 0) console.log(`Still working: ${count}`);
						console.log(err.message)
						console.log(item.path) // the file the error occurred on
					})
					.on('end', () => console.dir(items))
				this.readDir(d);
			},
			err => { console.log(`err: ${err}`); }
		);
	}

	private fileAccessFilter(path: string): boolean {
		if (path.startsWith("/proc")) return false;
		const fs = this.fs;
		try {
			fs.accessSync(path, fs.constants.F_OK | fs.constants.R_OK);
			return true;
		} catch(err) {
			return false;
		}
	}

	public chDir(path: string): void {
		const changed = this._es.path.resolve(path);
		this.currDir.next(changed);
	}

	public autocompleteDir(path: ParsedPath): string {
		try {
			// check if already a legit path, no need to autocomplete so return empty string
			this.fs.accessSync(this._es.path.format(path));
			return '';
		} catch (err) {
			const files = this.fs.readdirSync(path.dir)
				.filter(f => {
					return path.base.length > 0 && f.startsWith(path.base);
				})
				.map(f => f.replace(path.base, ''))
				.sort();
			return files.length > 0 ? files.shift() : '';
		}
	}

	private readDir(path: string): void {
		try {
			const files = this.fs.readdirSync(path).map(f => {
				const stats = this.fs.statSync(this._es.path.join(path, f));
				return { name: f, isHidden: f.startsWith("."), isDir: stats.isDirectory(), isFile: stats.isFile(), size: this.stringifySizeBytes(stats.size) };
			});
			this.dirContents.next(files);
		} catch (err) {
			this.dirContents.next(err);
		}
	}

	private stringifySizeBytes(bytes: number): string {
		let byteStr = "";
		if (bytes >= 1000000000000) {
			byteStr = (bytes / 1000000000000).toFixed(2) + " TB";
		} else if (bytes >= 1000000000) {
			byteStr = (bytes / 1000000000).toFixed(2) + " GB";
		} else if (bytes >= 1000000) {
			byteStr = (bytes / 1000000).toFixed(2) + " MB";
		} else if (bytes >= 1000) {
			byteStr = (bytes / 1000).toFixed(2) + " KB";
		} else {
			byteStr = bytes + " B"
		}
		return byteStr;
	}

}
