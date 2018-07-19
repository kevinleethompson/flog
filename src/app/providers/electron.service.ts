import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, remote } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as klaw from 'klaw';
import * as th2 from 'through2';

@Injectable()
export class ElectronService {

	ipcRenderer: typeof ipcRenderer;
	webFrame: typeof webFrame;
	remote: typeof remote;
	childProcess: typeof childProcess;
	fs: typeof fs;
	path: typeof path;
	klaw: typeof klaw;
	th2: typeof th2;

	constructor() {
		// Conditional imports
		if (this.isElectron()) {
			this.ipcRenderer = window.require('electron').ipcRenderer;
			this.webFrame = window.require('electron').webFrame;
			this.remote = window.require('electron').remote;

			this.childProcess = window.require('child_process');
			this.fs = window.require('fs');
			this.path = window.require('path');
			this.klaw = window.require('klaw');
			this.th2 = window.require('through2');
		}
	}

	isElectron = () => {
		return window && window.process && window.process.type;
	}

}
