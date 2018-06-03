import { Injectable, OnInit } from '@angular/core';
import { Observable, Subject, BehaviorSubject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ElectronService } from '../../../providers/electron.service';

@Injectable({
	providedIn: 'root'
})
export class DirNavService {
	private fs: any;
	private dirSnapshot: string;
	private currDir: Subject<string> = new BehaviorSubject(".");
	private dirContents: Subject<Object[]> = new BehaviorSubject([]);
	get cwd() { return this.currDir.asObservable(); }
	get contents(): Observable<Object[]> { return this.dirContents.asObservable(); }
	private pathPattern: RegExp = /^([/]?)(((\w|\d)+[-_\s]*)+[/]?)*([\w|\d]+[\.]?[^.$])*$/;

	constructor(private electronService: ElectronService) {
		this.fs = electronService.fs;
		this.init();
	}

	private init(): void {
		this.cwd.subscribe(
			d => {
				this.dirSnapshot = d;
				this.readDir(d);
			},
			err => { console.log(`err: ${err}`); }
		);
	}

	public chDir(path: string): void {
		console.log(path);
		this.currDir.next(path);
	}

	public autocompleteDir(path: string): string {
		console.log(path);
		if (!path.match(this.pathPattern)) return '';
		try {
			this.fs.accessSync(path);
			return '';
		} catch(err) {
			let parentDir = this.dirSnapshot;
			let subStr = path;
			const splitIdx = path.lastIndexOf("/") + 1;
			if (splitIdx > 0) {
				parentDir = path.substring(0, splitIdx);
				subStr = path.substring(splitIdx);
			}
			console.log(`parent: ${parentDir}`);
			const files = this.fs.readdirSync(parentDir)
				.filter(f => {
					return subStr.length > 0 && f.startsWith(subStr);
				})
				.map(f => f.replace(subStr, ''))
				.sort();
			console.log(files);
			return files.length > 0 ? files.shift() : '';
		}
	}

	private readDir(path: string): void {
		try {
			const files = this.fs.readdirSync(path).map(f => {
				const stats = this.fs.statSync(path + "/" + f);
				return {name: f, isHidden: f.startsWith("."), isDir: stats.isDirectory(), isFile: stats.isFile(), size: this.stringifySizeBytes(stats.size)};
			});
			this.dirContents.next(files);
		} catch(err) {
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
