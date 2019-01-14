import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { RicoService } from './rico-angular.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { ControllerProxy } from './controller-proxy';


/**
 * Integration Tests for rico-angular.
 */

describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  // TODO: this fails with "Error: The parameter model is mandatory in ControllerProxy(controllerId, model, manager)" 
  // - seems to be a mismatch between rico-js and rico core ?
  xdescribe('Controller without model ', () => {
    it('can be created', (done) => {
      const service: RicoService = TestBed.get(RicoService);
      const appRef = TestBed.get(ApplicationRef) as ApplicationRef;

      service.connect('http://localhost:8085/integration-tests/remoting', appRef).then(() => {
        return service.createController('ControllerWithoutModel');
      }).then((controllerProxy) => {
        expect(controllerProxy.model).toBeNull();

        done();
      }).catch((error) => {
        done.fail(error);
      });

    });

  });

  it('should be created', () => {
    const service: RicoService = TestBed.get(RicoService);
    expect(service).toBeTruthy();
  });

  describe('Property Controller ', () => {
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

        service.createController('PropertyController').then((controllerProxy) => {
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

    it('can be created', (done) => {
      expect(testControllerProxy).not.toBeNull();
      expect(testControllerProxy.model).not.toBeNull();

      done();
    });

    it('all property instances are created and are undefined by default', (done) => {
      expect(testControllerProxy).not.toBeNull();
      expect(testControllerProxy.model).not.toBeNull();

      expect(testControllerProxy.model.uuidValue).toBe(undefined);
      expect(testControllerProxy.model.stringValue).toBe(undefined);
      expect(testControllerProxy.model.shortValue).toBe(undefined);
      expect(testControllerProxy.model.longValue).toBe(undefined);
      expect(testControllerProxy.model.integerValue).toBe(undefined);
      expect(testControllerProxy.model.bigDecimalValue).toBe(undefined);
      expect(testControllerProxy.model.bigIntegerValue).toBe(undefined);
      expect(testControllerProxy.model.booleanValue).toBe(undefined);
      expect(testControllerProxy.model.byteValue).toBe(undefined);
      expect(testControllerProxy.model.calendarValue).toBe(undefined);
      expect(testControllerProxy.model.dateValue).toBe(undefined);
      expect(testControllerProxy.model.doubleValue).toBe(undefined);
      expect(testControllerProxy.model.enumValue).toBe(undefined);
      expect(testControllerProxy.model.floatValue).toBe(undefined);

      done();
    });

    it('all property values are synchronized', (done) => {
      expect(testControllerProxy).not.toBeNull();
      expect(testControllerProxy.model).not.toBeNull();

      testControllerProxy.invoke('setToDefaults').then(() => {
        expect(testControllerProxy.model.uuidValue).toBe('00000000-0000-04d3-0000-00000000aa2f');
        expect(testControllerProxy.model.stringValue).toBe('Hello World! äüö €€€ @@@ 人物');
        expect(testControllerProxy.model.shortValue).toBe(3);
        expect(testControllerProxy.model.longValue).toBe(-2);
        expect(testControllerProxy.model.integerValue).toBe(4711);
        expect(testControllerProxy.model.bigDecimalValue).toBe(12.23);
        expect(testControllerProxy.model.bigIntegerValue).toBe(12475);
        expect(testControllerProxy.model.booleanValue).toBe(true);
        expect(testControllerProxy.model.byteValue).toBe(12);
        expect(testControllerProxy.model.calendarValue.toISOString()).toBe('2017-03-03T04:08:00.000Z');
        expect(testControllerProxy.model.dateValue.toISOString()).toBe('2017-03-03T04:05:00.000Z');
        expect(testControllerProxy.model.doubleValue).toBe(1.00001);
        expect(testControllerProxy.model.enumValue).toBe('ANNOTATION_TYPE');
        expect(testControllerProxy.model.floatValue).toBe(1.01);

        done();
      });
    });

  });
});
