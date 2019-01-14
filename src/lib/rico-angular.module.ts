import { NgModule } from '@angular/core';
import { RicoService } from './rico-angular.service';
import { ControllerProxy } from './controller-proxy';

@NgModule({
  declarations: [],
  imports: [],
  exports: []
})

export class RicoAngularModule {
  constructor(private service: RicoService) {

  }
}
