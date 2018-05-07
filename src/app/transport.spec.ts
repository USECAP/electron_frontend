import {ElectronTransport} from './transport';
import {ElectronService} from 'ngx-electron';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/delay';


describe('ElectronTransport', () => {
  const electron = new ElectronService();
  const isElectron = electron.isElectronApp;
  const url = 'ws://localhost:4242';
  let transport: ElectronTransport;
  beforeEach(() => {
    transport = new ElectronTransport((url));
  });

  it('should raise an exception if not in electron', () => {
    if (!isElectron) {
      expect(() => new ElectronTransport(url)).toThrow();
    }
  });

  it('should not raise in electron', () => {
    if (isElectron) {
      expect(() => new ElectronTransport(url)).toBeTruthy();
    }
  });

  it('should handle "stat" with correct param', (done: DoneFn) => {
    if (!isElectron) {
      return;
    }
    transport.call('stat', ['/tmp']).subscribe(
      val => expect(val).toBeTruthy(),
      err => fail(err.toString()),
      () => done()
    );
  });

  it('should handle "stat" with no param', (done: DoneFn) => {
    if (!isElectron) {
      return;
    }
    transport.call('stat').subscribe(
      () => fail('should not have succeeded'),
      err => {
        expect(err.toString()).toContain('missing parameter');
        done();
      });
  });

  it('should handle "readDir" with correct param', (done: DoneFn) => {
    if (!isElectron) {
      return;
    }
    transport.call('readDir', ['test/fs']).subscribe(
      val => expect(val).toEqual(['a', 'b']),
      err => fail(err.toString()),
      () => done()
    );
  });

  it('should handle "readFile" with correct param', (done: DoneFn) => {
    if (!isElectron) {
      return;
    }
    transport.call('readFile', ['test/fs/a/testfile.txt']).subscribe(
      (val) => expect(val).toContain('Test Content'),
      (err) => fail(err.toString()),
      () => done()
    );
  });
});
