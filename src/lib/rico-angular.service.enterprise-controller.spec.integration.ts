import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { RicoService } from './rico-angular.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { ControllerProxy } from './controller-proxy';


describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  describe('Enterprise Controller ', () => {
    let service: RicoService;
    let testControllerProxy;

    beforeAll((done) => {
      const setupPromise = new Promise(function (resolve, reject) {
        service = TestBed.get(RicoService);

        const appRef = TestBed.get(ApplicationRef) as ApplicationRef;

        service.connect('http://localhost:8085/integration-tests/remoting', appRef).then(
          () => {
            resolve();
            done();
          }).catch((error) => {
            reject(error);
            done.fail(error);
          });
      });

      return setupPromise;
    });

    beforeEach((done) => {
      const setupPromise = new Promise(function (resolve, reject) {

        service.createController('EnterpriseController').then((controllerProxy) => {
          testControllerProxy = controllerProxy;
          resolve();
          done();
        }).catch((error) => {
          reject(error);
          done.fail(error);
        });

      });

      return setupPromise;
    });

    afterEach(() => {
      testControllerProxy.destroy();
    });

    it('@PostConstruct is executed', (done) => {
      expect(testControllerProxy.model).not.toBeNull();
      expect(testControllerProxy.model.postConstructCalled).toBeTruthy();
      done();
    });

  });
});
