import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-system-task-timer-settings',
  templateUrl: './create-system-task-timer-settings.component.html',
  styleUrls: ['./create-system-task-timer-settings.component.less'],
})
export class CreateSystemTaskTimerSettingsComponent implements OnInit {
  @Input() form: FormGroup = this.fb.group({});



  constructor(
    private fb: FormBuilder,
  ) { }


  ngOnInit(): void {
  }

}
