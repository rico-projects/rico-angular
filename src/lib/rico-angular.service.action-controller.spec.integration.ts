import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { RicoService } from './rico-angular.service';
import { ControllerProxy } from './controller-proxy';


/**
 * Integration tests for the ActionController
 */
describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  describe('ActionController ', () => {
    let testModel;
    let testControllerProxy: ControllerProxy;
    let service: RicoService;

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

        service.createController('ActionController').then((controllerProxy) => {
          testControllerProxy = controllerProxy;
          testModel = controllerProxy.model;
          resolve();
          done();
        }).catch((error) => {
          reject(error);
          done.fail(error);
        });
      });

      return setupPromise;
    });

    afterEach((done) => {
      return testControllerProxy.destroy()
        .then(
          () => { done(); })
        .catch(
          () => {
            done(); // ignore error on destroy
          });
    });


    it('public action method can be called', (done) => {
      expect(testModel.booleanValue).toBe(undefined);

      testControllerProxy.invoke('publicAction').then(() => {
        expect(testModel.booleanValue).toBe(true);

        done();
      }).catch((error) => {
        done.fail(error);
      });
    });

    it('public action with param method can be called', (done) => {
      testControllerProxy.invoke('publicWithBooleanParam', { value: true }).then(() => {
        expect(testModel.booleanValue).toBe(true);

        done();

      }).catch((error) => {
        done.fail(error);
      });

    });

    it('public action with null value param can be called', (done) => {

      // changing "undefined" to null is not valid, changing from a value to null works.
      testControllerProxy.invoke('publicWithBooleanParam', { value: true })
        .then(() => {
          expect(testModel.booleanValue).toBe(true);

          return testControllerProxy.invoke('publicWithBooleanParam', { value: null });
        })
        .then(() => {
          expect(testModel.booleanValue).toBe(null);

          done();
        }).catch((error) => {
          done.fail(error);
        });


    });

    it('private action method can be called', (done) => {
      expect(testModel.booleanValue).toBe(undefined);

      testControllerProxy.invoke('privateAction').then(() => {

        expect(testModel.booleanValue).toBe(true);

        done();
      }).catch((error) => {
        done.fail(error);
      });
    });

    it('private action with string param can be called', (done) => {
      testControllerProxy.invoke('privateWithStringParam', { value: 'Yeah!' }).then(() => {

        expect(testModel.booleanValue).toBe(true);
        expect(testModel.stringValue).toBe('Yeah!');

        done();
      }).catch((error) => {
        done.fail(error);
      });
    });

    it('private action with multiple params can be called', (done) => {
      const params = { 'value': 'Hello Rico!', 'value2': 'I want to test you!', 'value3': 356 };
      testControllerProxy.invoke('privateWithSeveralParams', params).then(() => {

        expect(testModel.booleanValue).toBe(true);
        expect(testModel.stringValue).toBe('Hello Rico!I want to test you!356');

        done();
      }).catch((error) => {
        done.fail(error);
      });
    });

    describe('numeric types', () => {
      it('public action with int params can be called', (done) => {
        expect(testModel.integerValue).toBe(undefined);

        testControllerProxy.invoke('withPublicIntegerParam', { 'value': 10 }).then(() => {
          expect(testModel.integerValue).toBe(10);
          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with int params can be called', (done) => {
        expect(testModel.integerValue).toBe(undefined);

        testControllerProxy.invoke('withPrivateIntegerParam', { 'value': 10 }).then(() => {
          expect(testModel.integerValue).toBe(10);
          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with int params can be called', (done) => {
        expect(testModel.integerValue).toBe(undefined);
        testControllerProxy.invoke('withSeveralPublicIntegerParams', { 'value': 1, 'value2': 2, 'value3': 3 }).then(() => {
          expect(testModel.integerValue).toBe(6);
          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with float params can be called', (done) => {
        expect(testModel.integerValue).toBe(undefined);
        testControllerProxy.invoke('withSeveralPublicDoubleParams', { 'value': 9.3, 'value2': 2.1, 'value3': 3.4 }).then(() => {
          expect(testModel.doubleValue).toBe(14.8);
          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with int params can be called', (done) => {
        expect(testModel.integerValue).toBe(undefined);
        testControllerProxy.invoke('withSeveralPrivateIntegerParams', { 'value': 1, 'value2': 2 }).then(() => {
          expect(testModel.integerValue).toBe(3);
          done();
        }).catch((error) => {
          done.fail(error);
        });
      });
    });

    describe('date types', () => {
      it('public action with date param can be called', (done) => {
        const date = new Date();
        testControllerProxy.invoke('withPublicDateParam', { 'value': date }).then(() => {

          expect(testModel.dateValue.toISOString()).toBe(date.toISOString());

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('private action with date param can be called', (done) => {
        const date = new Date();
        testControllerProxy.invoke('withPrivateDateParam', { 'value': date }).then(() => {

          expect(testModel.dateValue.toISOString()).toBe(date.toISOString());

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with java calendar param can be called', (done) => {
        const date = new Date();
        testControllerProxy.invoke('withPublicCalendarParam', { 'value': date }).then(() => {

          expect(testModel.calendarValue.toISOString()).toBe(date.toISOString());

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });
    });
  });
});
