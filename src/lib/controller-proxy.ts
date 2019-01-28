import { ApplicationRef } from '@angular/core';
import { LoggerFactory, LogLevel } from 'rico-js';
import { RicoService } from './rico-angular.service';

export class ControllerProxy {

    static globalCount: number = 0;
    static LOGGER: any = LoggerFactory.getLogger('RicoAngularAdapter::ControllerProxy');

    private internalModel: any;
    private vanillaControllerProxy: any;
    private appRef: ApplicationRef;
    private clientContext: any;
    private modelContainer: Map<any, Map<any, any>>;
    count: any;

    constructor(appRef: ApplicationRef, clientContext: any) {
        this.clientContext = clientContext;
        this.appRef = appRef;
        this.modelContainer = new Map();

        this.onBeanUpdateHandler = this.onBeanUpdateHandler.bind(this);
        this.onArrayUpdateHandler = this.onArrayUpdateHandler.bind(this);

        ControllerProxy.globalCount = ControllerProxy.globalCount + 1
        this.count = 'instance-count: ' + ControllerProxy.globalCount;
    }

    public get model(): any {
        return this.internalModel;
    }

    invoke(name: string, params?: any): Promise<any> {
        return this.vanillaControllerProxy.invoke(name, params);
    }

    create(name: string): Promise<ControllerProxy> {
        const proxy = this;

        return new Promise((resolve, reject) => {
            proxy.clientContext.createController(name).then((controllerProxy) => {
                ControllerProxy.LOGGER.debug('Controller proxy for', name, 'created', controllerProxy);

                proxy.vanillaControllerProxy = controllerProxy;
                proxy.internalModel = controllerProxy.model;

                proxy.init(proxy.internalModel);

                proxy.bindBeanManagerListenersForController(proxy.clientContext.beanManager, proxy.internalModel);

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

    isRemotingBean(bean) {
        return this.clientContext.beanManager.isManaged(bean);
    }

    isUnregisteredRemotingBean(bean) {
        return this.isRemotingBean(bean) && !this.modelContainer.has(bean);
    }

    init(bean) {
        if(!this.exists(bean)) {
            return;
        }

        if (this.isUnregisteredRemotingBean(bean)) {
            this.modelContainer.set(bean, new Map());
            let properties = Object.keys(bean);
            properties.forEach(p => {
                let value = bean[p];
                if(Array.isArray(value)) {
                    value.forEach(subValue => {
                        if (subValue !== null && this.isRemotingBean(subValue)) {
                            this.init(subValue);
                        } else {
                            this.watchProperty(bean, p);
                        }
                    });
                } else {
                    if (value !== null && this.isRemotingBean(value)) {
                        this.init(value);
                    } else {
                        this.watchProperty(bean, p);
                    }
                }
            });
        }
    }

    private bindBeanManagerListenersForController(beanManager: any, model: any) {
        const onBeanUpdateHandlerResult = beanManager.onBeanUpdate(this.onBeanUpdateHandler, model);
        const onArrayUpdateHandlerResult = beanManager.onArrayUpdate(this.onArrayUpdateHandler, model);
        // TODO The results should be used to clean up at the end

        ControllerProxy.LOGGER.debug('Rico remoting model binding listeners for Angular registered');
    }

    private onBeanUpdateHandler(bean: any, propertyName: string, newValue: any, oldValue: any) {
        ControllerProxy.LOGGER.debug('onBeanUpdateHandler', this.count, bean, propertyName, newValue, oldValue);
        let newProperty = true;
        for (const currentPropertyName in bean) {
            if (currentPropertyName === propertyName) {
                newProperty = false;
            }
        }

        if (oldValue === newValue) {
            return;
        }

        if (newProperty) {
            this.watchProperty(bean, propertyName);
        }
        bean[propertyName] = newValue;

        if (this.isUnregisteredRemotingBean(newValue)) {
            this.init(newValue)
        }

        this.appRef.tick();
        console.log('model', this.count, this.internalModel);
    }

    private onArrayUpdateHandler(bean: any, propertyName: string, index: number, count: number, newElements: Array<any>) {
        ControllerProxy.LOGGER.debug('onArrayUpdateHandler', this.count, bean, propertyName, index, count, newElements);

        const array = bean[propertyName];

        const oldElements = array.slice(index, index + count);
        if (this.deepEqual(newElements, oldElements)) {
            return;
        }

        if (typeof newElements === 'undefined' || (newElements && newElements.length === 0)) {
            array.splice(index, count);
        } else {
            this.injectArray(array, index, newElements);

            newElements.forEach( (element) => {
                if (this.isUnregisteredRemotingBean(element)) {
                    this.init(element);
                }
                // this.watchProperty(bean, propertyName);
            });
        }

        this.appRef.tick();
        console.log('model', this.count, this.internalModel);
    }

    private watchProperty(bean: any, propertyName: string) {
        ControllerProxy.LOGGER.debug(this.count, 'Watching', JSON.stringify(bean), 'property', propertyName);
        const proxy = this;
        const valueMap = proxy.modelContainer.get(bean);
        (function () {
            Object.defineProperty(bean, propertyName, {
                // Create a new getter for the property
                get: function () {
                    ControllerProxy.LOGGER.trace('Get for ' + propertyName);
                    return valueMap.get(propertyName);
                },
                // Create a new setter for the property
                set: function (value) {
                    ControllerProxy.LOGGER.trace('Set for', propertyName, 'with value', value);
                    proxy.clientContext.beanManager.classRepository.notifyBeanChange(bean, propertyName, value);
                    valueMap.set(propertyName, value);
                },
                enumerable: true
            });
        })();
    }

    private injectArray(baseArray: Array<any>, startIndex: number, insertArray: Array<any>) {
        baseArray.splice.apply(baseArray, [startIndex, 0].concat(insertArray));
    }

    private exists(object: any) {
        return typeof object !== 'undefined' && object !== null;
    }

    private deepEqual(array1: Array<any>, array2: Array<any>) {
        if (array1 === array2 || (!this.exists(array1) && !this.exists(array2))) {
            return true;
        }
        if (this.exists(array1) !== this.exists(array2)) {
            return false;
        }
        const n = array1.length;
        if (array2.length !== n) {
            return false;
        }
        for (let i = 0; i < n; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }
}
