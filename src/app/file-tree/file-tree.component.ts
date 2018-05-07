import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BackendService} from '../backend.service';
import {join} from 'path';
import 'rxjs/add/operator/mergeMap';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/do';

export class TreeNode {
  constructor(public fileName: string, public isDirectory: boolean) {
  }
}


@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
})
export class FileTreeComponent {
  isLoading = false;
  nodes$: Observable<TreeNode[]>;
  _selection: string;
  @Input() root: string;
  @Output() selectionChange = new EventEmitter<string>();

  @Input() set selection(selection: string) {
    this._selection = selection;
  }

  constructor(private backendService: BackendService) {
  }

  _isExpanded = false;

  get isExpanded(): boolean {
    return this._isExpanded;
  }

  set isExpanded(expanded: boolean) {
    if (!this._isExpanded && expanded) {
      this.setContent();
    }
    this._isExpanded = expanded;
  }

  private setContent() {
    this.isLoading = true;

    this.nodes$ = this.backendService.readDir(this.root).flatMap((files: string[]) => {
      const fileStats$ = files.map(filename => {
        const path = join(this.root, filename);
        return this.backendService.stat(path).map(stat =>
          new TreeNode(path, stat.isDirectory())
        );
      });
      return Observable.merge(...fileStats$);
    })
      .reduce((acc, val) => acc.concat(val), [])
      // Sort nodes such that directories come before files.
      .map(nodes => nodes.sort((a, b) => +b.isDirectory - +a.isDirectory))
      .do(undefined, undefined, () => this.isLoading = false);
  }
}
