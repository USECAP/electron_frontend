import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Vulnerability, VulnerabilityCategory} from '../models/vulnerability';

interface VulnerabilityGroup {
  name: string;
  isExpanded: boolean;
  size: number;
  vulnerabilities: Vulnerability[] | VulnerabilityGroup[];
}

@Component({
  selector: 'app-vulnerabilities-list',
  templateUrl: './vulnerabilities-list.component.html',
  styleUrls: ['./vulnerabilities-list.component.css']
})
export class VulnerabilitiesListComponent {
  isExpanded = true;
  selectedVulnerability: Vulnerability;

  private _categories: VulnerabilityCategory[];
  categoriesGroupedByFile: VulnerabilityGroup[];

  @Input()
  set categories(c: VulnerabilityCategory[]) {
    this._categories = c;
    this.categoriesGroupedByFile = this._categories.map(category => {
      return {
        name: category.name,
        isExpanded: category.isExpanded,
        size: category.vulnerabilities.length,
        vulnerabilities: this.groupByFile(category)
      };
    });
  }

  get categories() {
    return this._categories;
  }


  @Output() selectionChange = new EventEmitter();

  @Input() set selection(vulnerability: Vulnerability) {
    this.selectedVulnerability = vulnerability;
    this.selectionChange.emit(vulnerability);
  }

  groupByFile(category: VulnerabilityCategory): VulnerabilityGroup[] {
    const groups = {};
    for (const vulnerability of category.vulnerabilities) {
      const file = vulnerability.location.file;
      groups[file] = groups[file] || [];
      groups[file].push(vulnerability);
    }
    return Object.keys(groups).map(file_name => {
      const sortedGroup = groups[file_name].sort(
        (a: Vulnerability, b: Vulnerability) => a.location.line - b.location.line
      );
      return {
        isExpanded: false,
        name: file_name,
        size: sortedGroup.length,
        vulnerabilities: sortedGroup
      };
    });
  }
}
