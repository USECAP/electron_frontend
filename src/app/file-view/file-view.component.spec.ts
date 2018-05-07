import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {FileViewComponent} from './file-view.component';
import {CodeEditorComponent} from '../code-editor/code-editor.component';
import {BackendService} from '../backend.service';
import {of} from 'rxjs/observable/of';

describe('FileViewComponent', () => {
  let component: FileViewComponent;
  let fixture: ComponentFixture<FileViewComponent>;
  let backendService;

  beforeEach(async(() => {
    backendService = jasmine.createSpyObj('BackendService', ['readFile']);

    TestBed.configureTestingModule({
      declarations: [FileViewComponent, CodeEditorComponent],
      providers: [{provide: BackendService, useValue: backendService}]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('set path', () => {
    it('should should set content$', (done: DoneFn) => {
      const fileContent = 'file content';
      const filePath = '/some/file/path';

      backendService.readFile.and.returnValue(of(fileContent));
      component.path = filePath;
      expect(backendService.readFile).toHaveBeenCalledWith(filePath);
      component.content$.subscribe(
        content => expect(content).toEqual(fileContent),
        fail, done);
    });

    it('should not call backend if path is undefined', () => {
      component.path = undefined;
      expect(backendService.readFile).toHaveBeenCalledTimes(0);
    });
  });
});
