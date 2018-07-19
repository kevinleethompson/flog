import { Directive, Renderer2, ViewChild, ElementRef, OnInit, HostListener, OnDestroy } from '@angular/core';
import { DirNavService } from '../../services/dir-nav/dir-nav.service';
import { ElectronService } from '../../../providers/electron.service';
import { ParsedPath } from 'path';

@Directive({
	selector: '[highlightSyntax]'
})
export class HighlightSyntaxDirective implements OnInit, OnDestroy {

	private textnavEl: any;
	private changes: MutationObserver;
	private keywords: RegExp = /^(for|in|while|do|done)$/;
	private pathPattern: RegExp = /^([/]?)(((\w|\d)+[-_\s]*)+[/]?)*([\w|\d]+[\.]?[^.$])*$/;

	constructor(private _es: ElectronService, private navService: DirNavService, private renderer: Renderer2, private el: ElementRef) {
		this.changes = new MutationObserver((mutations: MutationRecord[]) => {
			console.log("once");
			mutations.forEach((mutation: MutationRecord) => { console.log(mutation); });
		});

		this.changes.observe(el.nativeElement, {
			attributes: false,
			childList: true,
			characterData: false
		});
	}

	@HostListener('input') onInput() { this.updateEditor(); }

	@HostListener('keydown', ['$event']) keyDown(e: KeyboardEvent) {
		this.handleKeyEvents(e);
	}
	@HostListener('mousedown', ['$event']) mouseDown(e) {
		e.target.style.caretColor = "transparent";
	}
	@HostListener('mouseup', ['$event']) mouseUp(e) {
		e.target.style.caretColor = "initial";
	}
	@HostListener('contextmenu', ['$event'])
	@HostListener('click', ['$event']) clickInput(e) {
		let sel = window.getSelection();
		if (e.target.hasAttribute("highlightsyntax")) {
			const el = sel.focusNode;
			const children = el.childNodes;
			if (sel.focusOffset == children.length && e.target.lastChild.id == "autocomplete") {
				const eolNode = children[children.length - 2];
				sel.collapse(eolNode, eolNode.childNodes.length);
			}
		}
		//console.log(selectedElement)
	}

	private handleKeyEvents(e: KeyboardEvent) {
		if (e.keyCode != 9 && e.keyCode != 13 && e.keyCode != 39 && e.keyCode != 35) return;
		const sel = window.getSelection();
		const range = sel.getRangeAt(0);
		const selIsTextNode = range.startContainer.nodeType === 3;
		let selectedElement = null;
		if (this.rangeSelectsSingleNode(range)) {
			// Selection encompasses a single element
			selectedElement = range.startContainer.childNodes[range.startOffset];
		} else if (selIsTextNode) {
			// Selection range starts inside a text node, so get its parent
			selectedElement = range.startContainer.parentNode;
		} else {
			// Selection starts inside an element
			selectedElement = range.startContainer;
		}
		const el: Element = e.srcElement as Element;
		const children = el.childNodes;
		const last = el.lastElementChild;
		if (last.id == "autocomplete") {
			const eolNode = children[children.length - 2];
			if (e.keyCode == 9) {
				e.preventDefault();
				last.id = "";
				last.attributes.removeNamedItem("contenteditable");
				this.updateEditor();
				sel.collapse(el, el.childNodes.length);
			}
			if (e.keyCode == 35) {
				e.preventDefault();
				sel.collapse(eolNode, eolNode.childNodes.length);
			}
			if (e.keyCode == 39 && selectedElement == children[children.length - 2]) {
				e.preventDefault();
				sel.collapse(eolNode, eolNode.childNodes.length);
			}
		}
		if (e.keyCode == 13) {
			e.preventDefault();
			const lastNode = children[children.length - 1];
			sel.collapse(lastNode, lastNode.childNodes.length);
		}
	}

	ngOnInit() {
		this.textnavEl = this.el.nativeElement;
		this.navService.cwd.subscribe(d => {
			this.textnavEl.innerHTML = this.renderText(d);
			const sel = window.getSelection();
			sel.collapse(this.textnavEl, this.textnavEl.childNodes.length);
			this.updateEditor();
		});
		this.updateEditor();
	}

	ngOnDestroy(): void {
		this.changes.disconnect();
	}

	private rangeSelectsSingleNode(range) {
		const startNode = range.startContainer;
		return startNode === range.endContainer &&
			startNode.hasChildNodes() &&
			range.endOffset === range.startOffset + 1;
	}

	private getTextSegments(element) {
		const textSegments = [];
		Array.from(element.childNodes).forEach((node: any) => {
			if (node.id == "autocomplete") return;
			switch (node.nodeType) {
				case Node.TEXT_NODE:
					textSegments.push({ text: node.nodeValue, node });
					break;

				case Node.ELEMENT_NODE:
					textSegments.splice(textSegments.length, 0, ...(this.getTextSegments(node)));
					break;

				default:
					throw new Error(`Unexpected node type: ${node.nodeType}`);
			}
		});
		return textSegments;
	}

	private updateEditor() {
		const sel = window.getSelection();
		const textSegments = this.getTextSegments(this.textnavEl);
		const textContent = textSegments.map(({ text }) => text).join('');
		let anchorIndex = null;
		let focusIndex = null;
		let currentIndex = 0;
		textSegments.forEach(({ text, node }) => {
			if (node === sel.anchorNode) {
				anchorIndex = currentIndex + sel.anchorOffset;
			}
			if (node === sel.focusNode) {
				focusIndex = currentIndex + sel.focusOffset;
			}
			currentIndex += text.length;
		});

		this.textnavEl.innerHTML = this.renderText(textContent);

		this.restoreSelection(anchorIndex, focusIndex);
	}

	private restoreSelection(absoluteAnchorIndex, absoluteFocusIndex) {
		const sel = window.getSelection();
		const textSegments = this.getTextSegments(this.textnavEl);
		let anchorNode = this.textnavEl;
		let anchorIndex = 0;
		let focusNode = this.textnavEl;
		let focusIndex = 0;
		let currentIndex = 0;
		textSegments.forEach(({ text, node }) => {
			const startIndexOfNode = currentIndex;
			const endIndexOfNode = startIndexOfNode + text.length;
			if (startIndexOfNode <= absoluteAnchorIndex && absoluteAnchorIndex <= endIndexOfNode) {
				anchorNode = node;
				anchorIndex = absoluteAnchorIndex - startIndexOfNode;
			}
			if (startIndexOfNode <= absoluteFocusIndex && absoluteFocusIndex <= endIndexOfNode) {
				focusNode = node;
				focusIndex = absoluteFocusIndex - startIndexOfNode;
			}
			currentIndex += text.length;
		});

		sel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
	}

	private renderText(text) {
		const words = text.split(/(\s+)/);
		const output = words.map((word) => {
			console.log(word);
			if (word.match(this.keywords)) {
				return `<span style='color:blue'>${word}</span>`;
			} else if (word.match(this.pathPattern)) {
				const parsed = this._es.path.parse(word) as ParsedPath;
				const autocomplete = this.navService.autocompleteDir(parsed);
				const pathSplit = word.split(this._es.path.sep).map(segment => { return `<span style='color:rgb(117, 97, 154)'>${segment}</span>`; });
				return autocomplete.length > 0 ? pathSplit.join("/") + `<span id="autocomplete" contenteditable="false" style='color:rgba(117, 97, 154, 0.35);user-select: none;pointer-events:none;overflow:visible;width:0;'>${autocomplete}</span>` : pathSplit.join(this._es.path.sep);
			} else {
				return word;
			}
		})
		return output.join('').trim();
	}

}
