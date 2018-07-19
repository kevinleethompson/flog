import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';

import { app } from 'electron';
import * as nedb from 'nedb';

const Datastore = window.require('nedb');

@Injectable()
export class NedbService {

	db: any = {};

	constructor(private _electronService: ElectronService) {
		const path = this._electronService.path;
		const userDataPath = this._electronService.remote.app.getPath('userData');
		this.db.recent_dirs = new Datastore({ filename: path.resolve(userDataPath, "recent_dirs.db"), autoload: true });
		this.db.recent_files = new Datastore({ filename: path.resolve(userDataPath, "recent_files.db"), autoload: true });
	}

	isElectron = () => {
		return window && window.process && window.process.type;
	}

}
