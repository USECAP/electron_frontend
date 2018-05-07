import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ElectronService} from 'ngx-electron';
import {Stats} from 'fs';
import * as path from 'path';

class Message {
  jsonrpc: string;
  id: number;
  method: string;
  parameters?: any;
}

export abstract class Transport {
  private static nextId = 1;

  protected static buildMessage(method: string, parameters?: any): Message {
    return {
      jsonrpc: '2.0',
      method: method,
      parameters: parameters,
      id: Transport.nextId++
    };
  }

  /**
   * Send data asynchronously.
   * @param {string} method
   * @param parameters (optional)
   * @returns {Observable<any>}
   */
  abstract call(method: string, parameters?: any): Observable<any>;
}

export class WebSocketTransport extends Transport {
  private static handlers = {};
  private subjects = new Map<number, Subject<any>>();
  private ws: WebSocket;
  private wsUrl: string;

  constructor(url: string) {
    super();
    this.wsUrl = url;
    this.openWebSocket();
  }

  call(method: string, parameters?: any): Observable<any> {
    // First check if we have a handler for this method
    const handler = WebSocketTransport.handlers[method];
    if (handler) {
      return handler.bind(this)(parameters);
    }

    const msg = Transport.buildMessage(method, parameters);
    this.subjects[msg.id] = new Subject<string>();
    this.send(msg);
    return this.subjects[msg.id].asObservable();
  }

  private openWebSocket(): void {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener('message', (ev => {
      this.dispatch(ev);
    }));
  }

  private send(msg: Message) {
    const state = this.ws.readyState;
    if (state === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else if (state === WebSocket.CONNECTING) {
      this.ws.addEventListener('open', () => {
        this.ws.send(JSON.stringify(msg));
      });
    } else if (state === WebSocket.CLOSED) {
      this.openWebSocket();
      this.send(msg);
    } else {
      console.error(`Websocket in an unexpected state ${state}`);
    }
  }

  private dispatch(ev: MessageEvent) {
    const msg = JSON.parse(ev.data.toString());
    const subject = this.subjects[msg.id];
    subject.next(msg.result);
    if (msg.completed !== false) {
      this.subjects.delete(msg.id);
      subject.complete();
    }
  }
}

export class ElectronTransport extends Transport {
  private static handlers = {
    stat: function (parameters?: any): Observable<Stats> {
      const result = new Subject<Stats>();
      if (!parameters || parameters.length !== 1) {
        result.error(new Error('missing parameter'));
        result.complete();
      } else {
        this.electron.remote.require('fs').stat(
          parameters[0],
          (err, stats) => {
            if (err) {
              result.error(err);
            } else {
              result.next(stats);
            }
            result.complete();
          });
      }
      return result.asObservable();
    },

    readDir: function (parameters?: any): Observable<string[]> {
      const result = new Subject<string[]>();
      if (!parameters || parameters.length !== 1) {
        result.error(new Error('missing parameter'));
        result.complete();
      } else {
        this.electron.remote.require('fs').readdir(
          parameters[0],
          (err, files) => {
            if (err) {
              result.error(err);
            } else {
              result.next(files);
            }
            result.complete();
          });
      }
      return result.asObservable();
    },

    readFile: function (parameters?: any): Observable<string> {
      const result = new Subject<string>();
      if (!parameters || parameters.length !== 1) {
        result.error(new Error('missing parameter'));
        result.complete();
      } else {
        this.electron.remote.require('fs').readFile(
          parameters[0],
          (err, content) => {
            if (err) {
              result.error(err);
            } else {
              result.next(content);
            }
            result.complete();
          });
      }
      return result.asObservable();
    },

    storeState: function (parameters?: any): Observable<void> {
      const result = new Subject<void>();
      if (!parameters || parameters.length !== 1) {
        result.error(new Error('missing parameter'));
        result.complete();
      } else {
        const userDataDir = this.electron.remote.app.getPath('userData');
        const fileName = path.join(userDataDir, 'projects.json');
        console.log(`writing state to ${fileName}`);
        this.electron.remote.require('fs').writeFile(
          fileName, JSON.stringify(parameters[0]),
          err => {
            if (err) {
              result.error(err);
            }
            result.complete();
          }
        );
      }

      return result.asObservable();
    },

    loadState: function (): Observable<object> {
      const result = new Subject<object>();
      const userDataDir = this.electron.remote.app.getPath('userData');
      const fileName = path.join(userDataDir, 'projects.json');
      this.electron.remote.require('fs').readFile(
        fileName,
        (err, content) => {
          if (err) {
            result.next({});
          } else {
            result.next(JSON.parse(content));
          }
          result.complete();
        }
      );

      return result.asObservable();
    }
  };

  private electron: ElectronService;
  private downstream: WebSocketTransport;

  constructor(url?: string) {
    super();

    this.electron = new ElectronService();
    if (!this.electron.isElectronApp) {
      throw Error('ElectronTransport can only be used in Electron!');
    }

    if (url) {
      this.downstream = new WebSocketTransport(url);
    } else {
      const backendServerPort = this.electron.remote.getGlobal('backendServerPort');
      this.downstream = new WebSocketTransport(`ws://localhost:${backendServerPort}`);
    }
  }

  call(method: string, parameters?: any): Observable<any> {
    // First check if we have a handler for this method
    const handler = ElectronTransport.handlers[method];
    if (handler) {
      return handler.bind(this)(parameters);
    }

    // Else, we just forward the method downstream.
    return this.downstream.call(method, parameters);
  }
}
