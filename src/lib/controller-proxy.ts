import { ApplicationRef } from '@angular/core';
import { LoggerFactory, LogLevel } from 'rico-js';

export class ControllerProxy {

    static LOGGER: any = LoggerFactory.getLogger('RicoAngularAdapter::ControllerProxy');

    private clientContext: any;
    private internalModel: any;
    private vanillaControllerProxy: any;
    private name: string;

    constructor(name: string, clientContext: any) {
        this.clientContext = clientContext;
        this.name = name;
    }

    public get model(): any {
        return this.internalModel;
    }

    invoke(name: string, params?: any): Promise<any> {
        return this.vanillaControllerProxy.invoke(name, params);
    }

    create(): Promise<ControllerProxy> {
        const proxy = this;

        return new Promise((resolve, reject) => {
            proxy.clientContext.createController(this.name).then((controllerProxy) => {
                ControllerProxy.LOGGER.debug('Controller proxy for', this.name, 'created', controllerProxy);

                proxy.vanillaControllerProxy = controllerProxy;
                proxy.internalModel = controllerProxy.model;

                if (ControllerProxy.LOGGER.isLogLevel(LogLevel.DEBUG)) {
                    // @ts-ignore
                    window._ricoModel = controllerProxy.model;
                    ControllerProxy.LOGGER.debug('Model ', JSON.stringify(controllerProxy.model));
                }

                resolve(proxy);

            })
            .catch((error) => {
              reject(error);
            });
        });
    }

    destroy(): Promise<void> {
        return this.vanillaControllerProxy.destroy();
    }

}
