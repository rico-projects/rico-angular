import { TestBed } from '@angular/core/testing';

import { RicoService } from './rico-angular.service';

describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RicoService = TestBed.get(RicoService);
    expect(service).toBeTruthy();
  });

  describe('createController', () => {

    let controllerProxyMock;
    let clientContextFactoryMock;
    let clientContextMock;
    let appRefMock;
    let resolveFunc;

    beforeEach(function() {
      appRefMock = jasmine.createSpyObj('appRefMock', ['tick']);

      controllerProxyMock = {
        model: {}
      }

      const beanManagerMock = jasmine.createSpyObj('beanManagerMock', ['onAdded', 'onRemoved', 'onBeanUpdate', 'onArrayUpdate']);

      clientContextMock = {
        beanManager: beanManagerMock,
        isConnected: false,
        connect() {
          this.isConnected = true;
          return Promise.resolve();
        },
        createController(name: string) {
          return new Promise(resolveFunc);
        }
      }

      clientContextFactoryMock = {
        create: function() {}
      };
      spyOn(clientContextFactoryMock, 'create').and.returnValue(clientContextMock);    
    });
  

    it('create one controller', (done) => {
      const service: RicoService = TestBed.get(RicoService);
      spyOn(service, 'getClientContextFactory').and.returnValue(clientContextFactoryMock);
      service.connect('http://www.foo.bar', appRefMock);

      resolveFunc = (resolve, reject) => {
        resolve(controllerProxyMock);
      };

      const promise = service.createController('bla');
      promise.then(() => {
        done();
      });
    });

    it('create two controllers', (done) => {
      const service: RicoService = TestBed.get(RicoService);
      spyOn(service, 'getClientContextFactory').and.returnValue(clientContextFactoryMock);
      service.connect('http://www.foo.bar', appRefMock);

      resolveFunc = (resolve, reject) => {
        resolve(controllerProxyMock);
      };

      const promiseA = service.createController('blaA');
      const promiseB = service.createController('blaB');

      let resolvedA = false;
      promiseA.then(() => {
        resolvedA = true;
      });

      promiseB.then(() => {
        if (resolvedA) {
          done();
        } else {
          done.fail();
        }
      });
    });

    it('create two controllers async', (done) => {
      const service: RicoService = TestBed.get(RicoService);
      spyOn(service, 'getClientContextFactory').and.returnValue(clientContextFactoryMock);
      service.connect('http://www.foo.bar', appRefMock);

      resolveFunc = (resolve, reject) => {
        setTimeout(() => {
          resolve(controllerProxyMock);
        }, 1000);
      };

      const promiseA = service.createController('blaA');
      const promiseB = service.createController('blaB');

      let resolvedA = false;
      promiseA.then(() => {
        resolvedA = true;
      });

      promiseB.then(() => {
        if (resolvedA) {
          done();
        } else {
          done.fail();
        }
      });
    });

  })

});
