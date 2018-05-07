import {BackendService} from './backend.service';
import {Server} from 'mock-socket';
import {Project} from './models/project';
import {WebSocketTransport} from './transport';
import {mergeScanResults, ScanResult, ResultsStatus} from './models/results';
import {timer} from 'rxjs/observable/timer';


describe('BackendService', () => {
  let service: BackendService;
  let mockServer: Server;

  beforeAll(() => {
    const url = 'ws://localhost:4242';
    mockServer = new Server(url);
    service = new BackendService(new WebSocketTransport(url));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call ping()', (done: DoneFn) => {
    mockServer.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'ping') {
        mockServer.send(JSON.stringify({
          id: msg.id,
          result: {message: 'pong'},
          completed: true
        }));
      }
    });

    service.ping().subscribe({
      next: value => {
        expect(value.message).toEqual('pong');
        expect(value.constructor.name).toEqual('PingMessage');
        expect(value.formatMessage()).toEqual(`hello, pong`);
      },
      error: () => fail('did not expect an error'),
      complete: () => done()
    });
  });


  describe('Backend scanning functionality', () => {
    let project: Project;
    let scan: ScanResult;
    const checkerArgs: string[] = ['--enable-checker', 'sample.checker', '--disable-checker', 'other.checker'];
    const vulnerabilityData = JSON.parse(`
    [{
      "path": [
        {
          "kind": "event",
          "location": {
            "line": 1000,
            "col": 25,
            "file": "xmlwriter.c"
          },
          "ranges": [
            [
              {
                "line": 1001,
                "col": 29,
                "file": "xmlwriter.c"
              },
              {
                "line": 1001,
                "col": 73,
                "file": "xmlwriter.c"
              }
            ]
          ],
          "depth": 0,
          "extended_message": "Value stored to 'count' is never read",
          "message": "Value stored to 'count' is never read"
        }
      ],
      "description": "Value stored to 'count' is never read",
      "category": "Dead store",
      "type": "Dead assignment",
      "check_name": "deadcode.DeadStores",
      "issue_hash_content_of_line_in_context": "f00928400deb11c3002ca8cfbcc70aac",
      "issue_context_kind": "function",
      "issue_context": "xmlTextWriterStartElement",
      "issue_hash_function_offset": "37",
      "location": {
        "line": 1000,
        "col": 25,
        "file": "xmlwriter.c"
      }
    }]`);

    beforeAll(() => {
      mockServer.on('message', data => {
        const msg = JSON.parse(data);
        if (msg.method === 'scanProject') {
          timer(10).subscribe(() => {
            mockServer.send(JSON.stringify({
              id: msg.id,
              result: {logs: 'foo', vulnerabilities: vulnerabilityData},
              completed: false
            }));
          });
          timer(20).subscribe(() => {
            mockServer.send(JSON.stringify({
              id: msg.id,
              result: {logs: 'bar', vulnerabilities: []},
              completed: false
            }));
          });
          timer(30).subscribe(() => {
            mockServer.send(JSON.stringify({
              id: msg.id,
              result: {logs: 'baz', vulnerabilities: vulnerabilityData},
              completed: true
            }));
          });
        }
      });
    });

    beforeEach(() => {
      project = new Project({
        name: 'test',
        location: 'path',
        buildSystem: 'buildSystem',
        buildCommand: 'buildCommand'
      });
      scan = new ScanResult(checkerArgs);
    });

    it('should eventually finish scanning', (done: DoneFn) => {
      service.scanProject(project, checkerArgs).subscribe(
        undefined,
        err => fail(err),
        done);
    });

    it('should update the logs', (done: DoneFn) => {
      service.scanProject(project, checkerArgs).subscribe(
        value => scan = mergeScanResults(scan, value),
        err => fail(err),
        () => {
          expect(scan.logs).toEqual('foo\nbar\nbaz');
          done();
        });
    });

    it('should update the vulnerabilities', (done: DoneFn) => {
      service.scanProject(project, checkerArgs).subscribe(
        value => scan = mergeScanResults(scan, value),
        err => fail(err),
        () => {
          scan.status = ResultsStatus.COMPLETE;
          expect(scan.vulnerabilities.length).toEqual(2);
          expect(JSON.stringify(scan.vulnerabilities[0])).toEqual(
            JSON.stringify(scan.vulnerabilities[1]));
          done();
        });
    });
  });
});

