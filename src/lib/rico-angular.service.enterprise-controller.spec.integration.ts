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

  describe('Enterprise Controller ', () => {
    let testModel;
    let testControllerProxy;
    beforeAll((done) => {
      let setupPromise = new Promise(function (resolve, reject) {
        const service: RicoService = TestBed.get(RicoService);
        const appRef = TestBed.get(ApplicationRef) as ApplicationRef;

        service.connect('http://localhost:8085/integration-tests/remoting', appRef).then(
          () => {
            service.createController('EnterpriseController').then((controllerProxy) => {
              testControllerProxy = controllerProxy;
              testModel = controllerProxy.model;
              resolve();
              done();
            });
          }).catch((error) => {
            done.fail(error);
          });
      });

      return setupPromise;
    });

    it('@PostConstruct is executed', (done) => {
      expect(testControllerProxy.model).not.toBeNull();
      expect(testControllerProxy.model.postConstructCalled).toBeTruthy();
      done();
    });

  });
});
