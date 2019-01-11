import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { RicoService } from './rico-angular.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { ControllerProxy } from './controller-proxy';


/**
 *
 */
describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RicoService = TestBed.get(RicoService);
    expect(service).toBeTruthy();
  });

  describe('BeanController ', () => {
    let beansTestModel;
    let beansTestControllerProxy: ControllerProxy;
    let service: RicoService;

    beforeAll((done) => {
      const setupPromise = new Promise(function (resolve, reject) {
        service = TestBed.get(RicoService);

        const appRef = TestBed.get(ApplicationRef) as ApplicationRef;

        service.connect('http://localhost:8085/integration-tests/remoting', appRef).then(() => {
          resolve();
          done();
        });
      }).catch((error) => {
        done.fail(error);
      });

      return setupPromise;
    });

    beforeEach((done) => {
      const setupPromise = new Promise(function (resolve, reject) {

        service.createController('BeanController').then((controllerProxy) => {
          beansTestControllerProxy = controllerProxy;
          beansTestModel = controllerProxy.model;
          resolve();
          done();
        });
      }).catch((error) => {
        done.fail(error);
      });

      return setupPromise;
    });

    afterEach((done) => {
      return beansTestControllerProxy.destroy().then(() => { done(); });
    });

    it('all bean types can be injected in a controller', (done) => {

      expect(beansTestModel.beanManagerInjected).toBeTruthy();
      expect(beansTestModel.clientSessionInjected).toBeTruthy();
      expect(beansTestModel.eventBusInjected).toBeTruthy();
      expect(beansTestModel.propertyBinderInjected).toBeTruthy();
      expect(beansTestModel.remotingContextInjected).toBeTruthy();

      done();
    });
  });
});
