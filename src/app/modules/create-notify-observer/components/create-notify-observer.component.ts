import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { NotifyObserver, NotifyObserverService, NotifyObserverTypes } from 'src/app/shared';
import { NotifyObserverModalActions } from '../create-notify-observer-modal-actions';
import { NotifyObserverTypeManagerService } from '../notify-observer-type-manager.service';
import { FormHostDirective } from './form-host.directive';
import { FormItemInterface } from './form-item.interface';

@Component({
  selector: 'app-create-notify-observer',
  templateUrl: './create-notify-observer.component.html',
  styleUrls: ['./create-notify-observer.component.less'],
})
export class CreateNotifyObserverComponent implements OnInit {
  @Input() baseForm: FormGroup = this.fb.group({});
  @Input() secondForm: FormGroup = this.fb.group({});
  @Input() disabledType = false
  @Input() notifyObserverInstance: Partial<NotifyObserver> = {}
  @Input() action: NotifyObserverModalActions = NotifyObserverModalActions.CREATE

  types: Array<{ label: string; value: NotifyObserverTypes }> = [];

  @ViewChild(FormHostDirective, { static: true }) formHost!: FormHostDirective;

  constructor(
    private fb: FormBuilder,
    private service: NotifyObserverService,
    private notifyObserverTypeService: NotifyObserverTypeManagerService
  ) { }

  ngOnInit(): void {
    this.service.queryTypes()
      .subscribe(types => {
        this.types = types;
      })

    this.baseForm.get('type')
      ?.valueChanges
      .pipe(
        startWith(this.baseForm.get('type')?.value)
      ).subscribe((type: NotifyObserverTypes) => {
        this.renderSecondForm(type)
      })
  }

  renderSecondForm(type: NotifyObserverTypes) {
    const secondForm = this.notifyObserverTypeService.createSecondForm(type, this.notifyObserverInstance, this.action)
    const component = this.notifyObserverTypeService.resolveComponent(type);

    const viewContainerRef = this.formHost.viewContainerRef;
    viewContainerRef.clear();

    if (component) {
      const componentRef = viewContainerRef.createComponent<FormItemInterface>(component);
      componentRef.instance.data = secondForm;
      componentRef.instance.action = this.action;

      this.secondForm = secondForm;
    }
  }
}
