import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {FileTreeComponent, TreeNode} from './file-tree.component';
import {ClarityModule} from '@clr/angular';
import {BackendService} from '../backend.service';
import {BasenamePipe} from '../pipes/basename.pipe';
import {of} from 'rxjs/observable/of';

describe('FileTreeComponent', () => {
  let component: FileTreeComponent;
  let fixture: ComponentFixture<FileTreeComponent>;
  let debugElem: DebugElement;

  beforeEach(() => {
    const fileStat = {isDirectory: () => false};
    const directoryStat = {isDirectory: () => true};
    const backendService = jasmine.createSpyObj('BackendService', ['readDir', 'stat']);
    backendService.readDir.and.returnValue(of(['file', 'directory']));
    backendService.stat = (fileName) => fileName === '/file' ? of(fileStat) : of(directoryStat);

    TestBed.configureTestingModule({
      declarations: [FileTreeComponent, BasenamePipe],
      imports: [ClarityModule, NoopAnimationsModule],
      providers: [{provide: BackendService, useValue: backendService}]
    }).compileComponents();

    fixture = TestBed.createComponent(FileTreeComponent);
    component = fixture.componentInstance;
    debugElem = fixture.debugElement;
  });

  it('should start unexpanded', () => {
    expect(component.isExpanded).toBeFalsy();
    const children = debugElem.queryAll(By.css('.file-tree-children'));
    expect(children.length).toEqual(0);
  });

  it('should expand children', () => {
    const rootLink = debugElem.query(By.css('.clr-treenode-link'));
    rootLink.triggerEventHandler('click', null);
    expect(component.isExpanded).toBeTruthy();
  });

  it('should set content after being expanded', (done: DoneFn) => {
    component.isExpanded = true;
    component.root = '/';
    expect(component.isLoading).toBeTruthy('should start loading');

    component.nodes$.subscribe(
      nodes => expect(nodes).toEqual([
        // Note that the directories should come first!
        new TreeNode('/directory', true),
        new TreeNode('/file', false),
      ]),
      err => fail(err),
      () => {
        expect(component.isLoading).toBeFalsy('should have stopped loading');
        done();
      }
    );
  });
});
