import {Component, Input} from '@angular/core';
import {colorSets} from '@swimlane/ngx-charts/release/utils';
import {VulnerabilityCategory} from '../models/vulnerability';

@Component({
  selector: 'app-vulnerabilities-overview',
  templateUrl: './vulnerabilities-overview.component.html',
  styleUrls: ['./vulnerabilities-overview.component.css']
})
export class VulnerabilitiesOverviewComponent {
  vulnerabilityCategoriesData = [];
  view: number[] = [700, 500];
  showLegend = true;
  legend = '';
  vulnerabilityCategoryScheme: any;
  vulnerabilityTypeScheme: any;
  showLabels = true;
  explodeSlices = false;
  doughnut = false;
  gradient = false;

  constructor() {
    this.vulnerabilityCategoryScheme = colorSets.find(cs => cs.name === 'cool');
    this.vulnerabilityTypeScheme = colorSets.find(cs => cs.name === 'natural');
  }

  @Input()
  set report(report: VulnerabilityCategory[]) {
    this.vulnerabilityCategoriesData = report.map(
      category => {
        return {name: category.name, value: category.vulnerabilities.length};
      });
  }
}
