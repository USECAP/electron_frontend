'use strict';

/**
 * Helper class to send data to a connection.
 */
class Sender {
  constructor(connection, id, handler) {
    this._connection = connection;
    this.id = id;
    this.handler = handler;
  }

  _send(data, useDefault = true) {
    if (useDefault) {
      data['jsonrpc'] = '2.0';
      data['id'] = this.id;
      for (let key of ['error', 'result']) {
        if (data.hasOwnProperty(key) && !data[key].hasOwnProperty('status')) {
          data[key]['status'] = this.handler.status;
        }
      }
    }
    let dataString = JSON.stringify(data);
    this._connection.send(dataString);
    // console.log(`sending ${dataString}`);
  }

  _sendError(code, message) {
    this._send({
      error: {code: code, message: message},
      completed: true,
    });
  }

  /**
   * Send logs that provide information about vulnerabilities.
   * @param logs the log message
   * @param vulnerabilities list of vulnerabilities
   */
  sendVulnerabilities(logs, vulnerabilities) {
    this._send({
      result: {logs: logs, vulnerabilities: vulnerabilities},
      completed: true
    });
  }

  /**
   * Pipe the stream to the sender.
   * @param stream the stream to be piped
   */
  sendDataFromStream(stream) {
    stream.on('data', (data) => {
      this.sendLogs(data.toString());
    });
  }

  /**
   * Send an error.
   * @param message the error message
   */
  sendError(message) {
    this._sendError(undefined, message);
  }

  /**
   * Send an Invalid Request Error.
   */
  sendInvalidRequest() {
    this._sendError(-32600, 'Invalid Request');
  }

  /**
   * Send simple logs.
   * @param logs the log message
   */
  sendLogs(logs) {
    this._send({
      result: {logs: logs, vulnerabilities: []},
      completed: false
    });
  }

  /**
   * Send final logs.
   * @param logs the log message
   */
  sendStopLogs(logs) {
    this._send({
      result: {logs: logs, vulnerabilities: []},
      completed: true
    });
  }
}

module.exports = {Sender};
