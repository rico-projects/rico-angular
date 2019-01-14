import { Injectable, ApplicationRef } from '@angular/core';
import { getService, LoggerFactory } from 'rico-js';
import { ControllerProxy } from './controller-proxy';

@Injectable({
  providedIn: 'root'
})
export class RicoService {
  static LOGGER: any = LoggerFactory.getLogger('RicoService');

  private contextFactory: any;
  private clientContext: any;
  private appRef: ApplicationRef;

  constructor() {
    RicoService.LOGGER.debug('RicoService created');
  }

  connect(remotingEndpoint: string, appRef: ApplicationRef): Promise<any> {
    this.appRef = appRef;
    if (!this.contextFactory) {
      this.contextFactory = this.getClientContextFactory();
    }

    if (!this.clientContext) {
      this.clientContext = this.contextFactory.create(remotingEndpoint);
    }

    return this.clientContext.connect();
  }

  /**
   * provide rico.js base method 'getService'
   *
   * @param name Name of service, e.g. "Http", "ClientContextFactory"
   */
  getService(name: string) {
    return getService(name);
  }

  getClientContextFactory() {
    return getService('ClientContextFactory');
  }

  getHttpClient() {
    return getService('HttpClilent');
  }

  getLogger(name: string) {
    return LoggerFactory.getLogger(name);
  }

  createController(name: string): Promise<ControllerProxy> {
    if (this.clientContext && this.clientContext.isConnected) {
      const controllerProxy = new ControllerProxy(this.appRef, this.clientContext);
      return controllerProxy.create(name);
    } else {
      return Promise.reject('Cannot create controller. ClientContext not conntected');
    }
  }
}
