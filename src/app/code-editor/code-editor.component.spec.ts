import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CodeEditorComponent} from './code-editor.component';
import {NgxElectronModule} from 'ngx-electron';
import {ElectronService} from 'ngx-electron';

describe('CodeEditorComponent', () => {
  let component: CodeEditorComponent;
  let fixture: ComponentFixture<CodeEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CodeEditorComponent],
      imports: [NgxElectronModule],
      providers: [ElectronService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
