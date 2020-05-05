import { Injectable, ApplicationRef } from '@angular/core';
import { getService, LoggerFactory } from '@rico-projects/rico-js';
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
  private queue: Array<Function>;
  private triggerResolveQueue: boolean;

  constructor() {
    RicoService.LOGGER.debug('RicoService created');
    this.queue = [];
    this.triggerResolveQueue = true;
  }

  connect(remotingEndpoint: string, appRef: ApplicationRef): Promise<any> {
    if (!this.contextFactory) {
      this.contextFactory = this.getClientContextFactory();
    }

    if (!this.clientContext) {
      this.clientContext = this.contextFactory.create(remotingEndpoint);
      this.modelMaintainer = new ModelMaintainer(appRef, this.clientContext);
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
      return new Promise<ControllerProxy>((resolve, reject) => {
        const controllerProxy = new ControllerProxy(name, this.clientContext);
        this.addToQueue(controllerProxy, resolve, reject);
      });
    } else {
      return Promise.reject('Cannot create controller. ClientContext not conntected');
    }
  }

  private addToQueue(controllerProxy: ControllerProxy, resolve: Function, reject: Function) {
    const promise = new Promise((res) => {
      this.queue.push(res);
    });

    promise.then(() => {
      controllerProxy.create().then((ctrlProxy) => {
        resolve(ctrlProxy);
        this.resolveFromQueue();
      }).catch((error) => {
        reject(error);
      });
    });

    if (this.triggerResolveQueue) {
      this.resolveFromQueue();
      this.triggerResolveQueue = false;
    }
  }

  private resolveFromQueue() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.triggerResolveQueue = true;
    }
  }
}
