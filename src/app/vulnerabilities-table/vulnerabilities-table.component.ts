import {Component, Input} from '@angular/core';
import {VulnerabilityCategory} from '../models/vulnerability';

interface Row {
  categories: string[];
  file: string;
  count: number;
}

@Component({
  selector: 'app-vulnerabilities-table',
  templateUrl: './vulnerabilities-table.component.html',
  styleUrls: ['./vulnerabilities-table.component.css']
})
export class VulnerabilitiesTableComponent {
  maxPage: number;
  currentPage = 1;

  private _data: Row[];

  get data(): Row[] {
    return this._data;
  }

  set data(data: Row[]) {
    data.sort((a: Row, b: Row) => {
      return b.count - a.count;
    });
    this._data = data;
    this.maxPage = Math.ceil(data.length / 10);
  }

  @Input()
  set report(report: VulnerabilityCategory[]) {
    const data = [];
    const fileInfos = new Map<string, { categories: Set<string>, count: number }>();

    for (const category of report) {
      for (const vuln of category.vulnerabilities) {
        const file = vuln.location.file;
        if (!fileInfos.has(file)) {
          fileInfos.set(file, {categories: new Set<string>(), count: 0});
        }
        const info = fileInfos.get(file);
        info.count++;
        info.categories.add(category.name);
      }
    }
    for (const [file, info] of fileInfos) {
      data.push({
        file: file,
        count: info.count,
        categories: Array.from(info.categories),
      });
    }
    this.data = data;
  }

  nextPage() {
    this.currentPage = Math.min(this.currentPage + 1, this.maxPage);
  }

  prevPage() {
    this.currentPage = Math.max(this.currentPage - 1, 1);
  }
}
