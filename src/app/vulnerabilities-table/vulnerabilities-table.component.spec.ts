import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {VulnerabilitiesTableComponent} from './vulnerabilities-table.component';
import {ClarityModule} from '@clr/angular';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('VulnerabilitiesTableComponent', () => {
  let component: VulnerabilitiesTableComponent;
  let fixture: ComponentFixture<VulnerabilitiesTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VulnerabilitiesTableComponent],
      imports: [ClarityModule, NoopAnimationsModule],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VulnerabilitiesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the vulnerabilityReport', function () {
    component.report = [{
      name: 'category 1',
      isExpanded: false,
      isSelected: false,
      vulnerabilities: [
        {
          description: '', category: '', type: '', steps: [],
          location: {file: 'src/a.c', column: 0, line: 0}
        },
        {
          description: '', category: '', type: '', steps: [],
          location: {file: 'src/sub/a.c', column: 0, line: 0}
        }
      ]
    }, {
      name: 'category 2',
      isExpanded: false,
      isSelected: false,
      vulnerabilities: [
        {
          description: '', category: '', type: '', steps: [],
          location: {file: 'src/a.c', column: 0, line: 0}
        }
      ]
    }];
    expect(component.data).toEqual([{
      categories: ['category 1', 'category 2'],
      file: 'src/a.c',
      count: 2
    }, {
      categories: ['category 1'],
      file: 'src/sub/a.c',
      count: 1
    }]);
  });
});
