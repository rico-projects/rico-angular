import { Injectable, ApplicationRef } from '@angular/core';
import { getService, LoggerFactory } from 'rico-js';
import { ControllerProxy } from './controller-proxy';
import { ModelMaintainer } from './model-maintainer';

@Injectable({
  providedIn: 'root'
})
export class RicoService {
  static LOGGER: any = LoggerFactory.getLogger('RicoService');

  private contextFactory: any;
  private clientContext: any;
  private modelMaintainer: ModelMaintainer;

  constructor() {
    RicoService.LOGGER.debug('RicoService created');
    this.modelMaintainer = new ModelMaintainer();
  }

  connect(remotingEndpoint: string, appRef: ApplicationRef): Promise<any> {
    if (!this.contextFactory) {
      this.contextFactory = this.getClientContextFactory();
    }

    if (!this.clientContext) {
      this.clientContext = this.contextFactory.create(remotingEndpoint);
      this.modelMaintainer.init(appRef, this.clientContext);
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
    return getService('HttpClient');
  }

  getLogger(name: string) {
    return LoggerFactory.getLogger(name);
  }

  createController(name: string): Promise<ControllerProxy> {
    if (this.clientContext && this.clientContext.isConnected) {
      const controllerProxy = new ControllerProxy(this.clientContext);
      return controllerProxy.create(name);
    } else {
      return Promise.reject('Cannot create controller. ClientContext not conntected');
    }
  }
}
