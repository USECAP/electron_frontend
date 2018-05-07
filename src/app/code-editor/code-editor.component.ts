import {Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import 'rxjs/add/operator/first';

// declare all the built in electron objects
declare const electron: any;
declare const monaco: any;
declare const require: any;
declare const process: any;

@Component({
  selector: 'app-code-editor',
  template: `<div class="editorContainer" #editorContainer></div>`,
  styleUrls: ['./code-editor.component.css'],
})
export class CodeEditorComponent implements OnInit {
  // counter for ids to allow for multiple editors on one page
  private static uniqueCounter = 0;

  @ViewChild('editorContainer') _editorContainer: ElementRef;
  /**
   * editorInitialized: function($event)
   * Event emitted when editor is first initialized
   */
  @Output() onEditorInitialized: EventEmitter<void> = new EventEmitter<void>();

  @Output() didScrollTo: EventEmitter<any> = new EventEmitter<any>();

  private editorInitialized = false;
  private editorBasePath = '';
  private _webview: any;
  private _editorInnerContainer = 'editorInnerContainer' + CodeEditorComponent.uniqueCounter++;
  private _editorStyle = 'width:100%;height:100%;border:1px solid grey;';
  private editorOptions = {readonly: true};

  constructor(private zone: NgZone, private electronService: ElectronService) {
    this.setEditorBasePath();
  }

  private _value = '';
  private _selectedStepIndex: number;
  private _stepsRange: {first: number, last: number};

  get value(): string {
    return this._value;
  }

  @Input()
  set selectedStepIndex(value: number) {
    this._selectedStepIndex = value;
    this.gotoSelectedLine();
  }

  @Input()
  set stepsRange(value: {first: number, last: number}) {
    this._stepsRange = value;
    this.gotoSelectedLine();
  }

  /**
   * value?: string
   * Value in the Editor after async getEditorContent was called
   */
  @Input('value')
  set value(value: string) {
    // console.log('setting editor value');
    if (this._value === value) {
      return;
    }
    this._value = value;

    this.sendToEditorOnceReady('setEditorContent', value);
    this.sendToEditorOnceReady('setDeltaDecorations', this._deltaDecorations);
  }

  private _codeLenses = [];

  get codeLenses() {
    return JSON.stringify(this._codeLenses);
  }

  @Input('codeLenses')
  set codeLenses(lenses: any) {
    this._codeLenses = lenses;
    this.sendToEditorOnceReady('setCodeLenses', lenses);
    this.gotoSelectedLine();
  }

  private _deltaDecorations = [];

  @Input('deltaDecorations')
  set deltaDecorations(deltaDecorations: any[]) {
    this._deltaDecorations = deltaDecorations;
    this.sendToEditorOnceReady('setDeltaDecorations', this._deltaDecorations);
    this.gotoSelectedLine();
  }

  /**
   * layout method that calls layout method of editor and instructs the editor to remeasure its container
   */
  layout(): void {
    this.sendToEditorOnceReady('layout');
  }

  /**
   * ngOnInit only used for Electron version of editor
   * This is where the webview is created to sandbox away the editor
   */
  ngOnInit(): void {
    // language=HTML
    // noinspection CssUnusedSymbol, AmdModulesDependencies
    const editorHTML = `
<!DOCTYPE html>
<html style="height:100%">
<head>
  <base href="./">
  <meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
  <link rel="stylesheet" data-name="vs/editor/editor.main"
        href="${this.editorBasePath}/vs/editor/editor.main.css">
</head>
<body style="height:100%;width: 100%;margin: 0;padding: 0;overflow: hidden;">
<style type="text/css">
.vulnerability {
  color: red !important;
  font-weight: bold;
  text-decoration: underline;
}
.glyphMarginClass {
  background: red;
}
.monaco-editor .codelens-decoration {
  color: black !important;
  background: lightyellow !important;
  font-size: 90% !important;
}
</style>
<div id="${this._editorInnerContainer}" style="width:100%;height:100%;${this._editorStyle}"></div>
<script>
    // Get the ipcRenderer of electron for communication
    const {ipcRenderer} = require('electron');
</script>
<script src="${this.editorBasePath}/vs/loader.js"></script>
<script>
    let editor;
    let startLine = 0;
    let value = '${this._value}';
    let codeLenses = ${this.codeLenses};
    let deltaDecorations = ${JSON.stringify(this._deltaDecorations)};
    let decorationIds = [];
    let codeLensProvider;

    function setDeltaDecorations(newDecorations) {
        // make sure we have new decorations
        if (!newDecorations || newDecorations.length === 0 || !editor) {
            return;
        }

        // set delta decorations
        // console.log('setDeltaDecorations: ' + newDecorations);
        deltaDecorations = newDecorations;
        decorationIds = editor.deltaDecorations(decorationIds, deltaDecorations);
    }

    require.config({
        baseUrl: '${this.editorBasePath}'
    });
    self.module = undefined;
    self.process.browser = true;

    require(['vs/editor/editor.main'], function() {
        editor = monaco.editor.create(document.getElementById('${this._editorInnerContainer}'), Object.assign({
            value: value,
            language: 'c',
            theme: 'vs',
            glyphMargin: true
        }, ${JSON.stringify(this.editorOptions)}));
        // Setup code lens provider over ipc
        codeLensProvider = monaco.languages.registerCodeLensProvider('c', {
            provideCodeLenses: function() {
                return codeLenses;
            },
            resolveCodeLens: function(model, codeLens) {
                return codeLens;
            }
        });
        editor.deltaDecorations([], deltaDecorations);
        ipcRenderer.sendToHost("onEditorInitialized", '');
    });

    ipcRenderer.on('setDeltaDecorations', function(event, data) {
        setDeltaDecorations(data);
    });

    // Set the value of the editor from what was sent from the main view
    ipcRenderer.on('setEditorContent', function(event, data) {
        value = data;
        editor.setValue(data);
        editor.revealLineInCenter(startLine);
    });

    ipcRenderer.on('setCodeLenses', function(event, data) {
        if (codeLensProvider) {
            codeLensProvider.dispose();
        }
        codeLensProvider = monaco.languages.registerCodeLensProvider('c', {
            provideCodeLenses: function() {
                // console.log('running provideCodeLenses');
                return data;
            },
            resolveCodeLens: function(model, codeLens) {
                return codeLens;
            }
        });
    });

    ipcRenderer.on('setStartLine', function(event, data) {
      startLine = data;
      editor.revealLineInCenter(startLine);
    });

    // Instruct the editor to remeasure its container
    /*
    ipcRenderer.on('layout', function() {
        editor.layout();
    });
    */

    // need to manually resize the editor any time the window size
    // changes. See: https://github.com/Microsoft/monaco-editor/issues/28
    window.addEventListener("resize", function resizeEditor() {
        editor.layout();
    });
</script>
</body>
</html>`;

    // dynamically create the Electron Webview Element
    // this will sandbox the monaco code into its own DOM and its own
    // javascript instance. Need to do this to avoid problems with monaco
    // using AMD Requires and Electron using Node Requires
    // see https://github.com/Microsoft/monaco-editor/issues/90
    this._webview = document.createElement('webview');
    this._webview.setAttribute('nodeintegration', 'true');
    this._webview.setAttribute('disablewebsecurity', 'true');
    // take the html content for the webview and base64 encode it and use as the src tag
    this._webview.setAttribute('src', 'data:text/html;base64,' + window.btoa(editorHTML));
    this._webview.setAttribute('style', 'display:inline-flex; width:100%; height:100%');
    // this._webview.addEventListener('dom-ready', () => {
    //   this._webview.openDevTools();
    // });

    // Process the data from the webview
    this._webview.addEventListener('ipc-message', (event: any) => {
      // console.log(`editor event ${event.channel}`);
      if (event.channel === 'onEditorInitialized') {
        this.editorInitialized = true;
        this.onEditorInitialized.emit(undefined);
      }
    });

    // append the webview to the DOM
    this._editorContainer.nativeElement.appendChild(this._webview);
  }

  private sendToEditorOnceReady(channel: string, value?: any) {
    // console.log(`sending to editor on channel '${channel}' data ${value}`);
    if (this.editorInitialized) {
      this._webview.send(channel, value);
    } else {
      this.onEditorInitialized.first().subscribe(() => {
        this._webview.send(channel, value);
      });
    }
  }

  private setEditorBasePath(): void {
    if (this.electronService.isElectronApp && this.electronService.remote) {
      let appPath = this.electronService.remote.app.getAppPath();
      appPath = appPath.replace(/\\/g, '/'); // replace \ in Windows paths
      if (window.location.protocol === 'http:') {
        const parts = appPath.split('/node_modules');
        if (parts.length !== 2) {
          console.log(`could not infer editor path from ${appPath}`);
          return;
        }
         // check if app is running on windoof
        if (this.electronService.process.platform === 'win32') {
          // windoof requires /// after file when path should start with C:/
          this.editorBasePath = `file:///${parts[0]}/node_modules/monaco-editor/min`;
        } else {
          this.editorBasePath = `file://${parts[0]}/node_modules/monaco-editor/min`;
        }
      } else if (window.location.protocol === 'file:') {
        this.editorBasePath = `file://${appPath}/libs`;
      } else {
        console.log(`could not infer editor path for protocol ${window.location.protocol}`);
        return;
      }
    }
  }

  private gotoSelectedLine() {
    let selectedLine = 0;
    if (this._codeLenses.length > 0) {
      let stepIndex = this._codeLenses.length - 1;
      if (this._selectedStepIndex >= this._stepsRange.first && this._selectedStepIndex <= this._stepsRange.last) {
        this.didScrollTo.emit(this._webview);
        stepIndex = this._selectedStepIndex - this._stepsRange.first;
        selectedLine = this._codeLenses[stepIndex].range.startLineNumber;
        this.sendToEditorOnceReady('setStartLine', selectedLine);
        this.updateDecorations(selectedLine);
        return;
      }
    }
    this.updateDecorations();
  }

  private updateDecorations(selectedLine?: number) {
    this._deltaDecorations.forEach(decoration => {
      if (selectedLine !== undefined && decoration.range.startLineNumber === selectedLine) {
        decoration.options.glyphMarginClassName = 'glyphMarginClass';
      } else {
        delete decoration.options.glyphMarginClassName;
      }
    });
    this.sendToEditorOnceReady('setDeltaDecorations', this._deltaDecorations);
  }
}
