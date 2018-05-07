import {FuzzingResult, ScanResult} from './results';
import 'rxjs/add/operator/last';

export class Project {
  name: string;
  location: string;
  buildSystem: string;
  buildCommand: string;
  scans: ScanResult[] = [];
  fuzzingResults: FuzzingResult[] = [];

  constructor(project_data: {
      name: string, location: string, buildSystem: string, buildCommand: string,
      scans?: ScanResult[], fuzzingResults?: FuzzingResult[] }) {
    this.name = project_data.name;
    this.location = project_data.location;
    this.buildSystem = project_data.buildSystem;
    this.buildCommand = project_data.buildCommand;
    this.scans = project_data.scans || [];
    this.fuzzingResults = project_data.fuzzingResults || [];
  }
}
