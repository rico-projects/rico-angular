import { TestBed } from '@angular/core/testing';
import { ApplicationRef } from '@angular/core';
import { RicoService } from './rico-angular.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';


/**
 * 
 */

describe('RicoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RicoService = TestBed.get(RicoService);
    expect(service).toBeTruthy();
  });

  describe('ActionController ', () => {
    let testModel;
    let testControllerProxy;
    beforeAll(() => {
      let setupPromise = new Promise(function (resolve, reject) {
        const service: RicoService = TestBed.get(RicoService);
        const appRef = TestBed.get(ApplicationRef) as ApplicationRef;

        service.connect('http://localhost:8085/integration-tests/remoting', appRef).then(
          () => {
            service.createController('ActionController').then((controllerProxy) => {
              testControllerProxy = controllerProxy;
              testModel = controllerProxy.model;
              resolve();
            });
          });
      });

      return setupPromise;
    });



    it('public action method can be called', (done) => {
      expect(testModel.booleanValue).toBe(undefined);

      testControllerProxy.invoke('publicAction').then(() => {
        console.log(testModel);
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

    it('public action with null value for param can be called', (done) => {

      testControllerProxy.invoke('publicWithBooleanParam', { value: null }).then(() => {
        expect(testModel.booleanValue).toBe(null);

        done();

      }).catch((error) => {
        done.fail(error);
      });

    });

    it('private action method can be called', (done) => {
      expect(testModel.booleanValue).toBe(null);

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
      testControllerProxy.invoke('privateWithSeveralParams', { 'value': 'Hello Rico!', 'value2': 'I want to test you!', 'value3': 356 }).then(() => {

        expect(testModel.booleanValue).toBe(true);
        expect(testModel.stringValue).toBe('Hello Rico!I want to test you!356');

        done();
      }).catch((error) => {
        done.fail(error);
      });
    });

    describe('numeric types', () => {
      it('public action with int params can be called', (done) => {
        testControllerProxy.invoke('withPublicIntegerParam', { 'value': 10 }).then(() => {

          expect(testModel.integerValue).toBe(10);

          //reset to 0;
          testModel.integerValue = 0;

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with int params can be called', (done) => {
        testControllerProxy.invoke('withPrivateIntegerParam', { 'value': 10 }).then(() => {

          expect(testModel.integerValue).toBe(10);

          //reset to 0;
          testModel.integerValue = 0;

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with int params can be called', (done) => {
        testControllerProxy.invoke('withSeveralPublicIntegerParams', { 'value': 1, 'value2': 2, 'value3': 3 }).then(() => {

          expect(testModel.integerValue).toBe(6);

          //reset to 0;
          testModel.integerValue = 0;

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with float params can be called', (done) => {
        testControllerProxy.invoke('withSeveralPublicDoubleParams', { 'value': 9.3, 'value2': 2.1, 'value3': 3.4 }).then(() => {

          expect(testModel.doubleValue).toBe(14.8);

          //reset to 0;
          testModel.integerValue = 0;

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with int params can be called', (done) => {
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
        let date = new Date();
        testControllerProxy.invoke('withPublicDateParam', { 'value': date }).then(() => {

          expect(testModel.dateValue.toISOString()).toBe(date.toISOString());

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('private action with date param can be called', (done) => {
        let date = new Date();
        testControllerProxy.invoke('withPrivateDateParam', { 'value': date }).then(() => {

          expect(testModel.dateValue.toISOString()).toBe(date.toISOString());

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

      it('public action with java calendar param can be called', (done) => {
        let date = new Date();
        testControllerProxy.invoke('withPublicCalendarParam', { 'value': date }).then(() => {

          expect(testModel.calendarValue.toISOString()).toBe(date.toISOString());

          done();
        }).catch((error) => {
          done.fail(error);
        });
      });

    });


  });


  describe('BeansController ', () => {
    let beansTestModel;
    let beansTestControllerProxy;
    beforeAll((done) => {
      let setupPromise = new Promise(function (resolve, reject) {
        const service: RicoService = TestBed.get(RicoService);
        const appRef = TestBed.get(ApplicationRef) as ApplicationRef;

        service.connect('http://localhost:8085/integration-tests/remoting', appRef).then(
          () => {
            service.createController('BeanController').then((controllerProxy) => {
              beansTestControllerProxy = controllerProxy;
              beansTestModel = controllerProxy.model;
              resolve();
              done();
            });
          }).catch((error) => {
            done.fail(error);
          });;
      });

      return setupPromise;
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

  //TODO: this fails with "Error: The parameter model is mandatory in ControllerProxy(controllerId, model, manager)" - seems to be a mismatch between rico-js and rico core ?
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
          });;
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
