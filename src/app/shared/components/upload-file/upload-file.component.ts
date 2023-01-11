import {
  Component,
  TemplateRef,
  StaticProvider,
  forwardRef,
  OnDestroy,
  ViewChild
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import * as uuid from 'uuid'
import { SharedService } from '../../services'
import { environment } from 'src/environments/environment';

export const UPLOAD_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => UploadFileComponent),
  multi: true
}

@Component({
  selector: 'upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
  providers: [UPLOAD_VALUE_ACCESSOR]
})
export class UploadFileComponent implements ControlValueAccessor, OnDestroy {
  imageUrl: string = ''
  loading = false

  private onChange: Function = () => { }
  private destroySubject = new Subject<void>()
  public id = uuid.v4()

  constructor(
    private sharedService: SharedService,
    private notify: NzNotificationService,
    private message: NzMessageService
  ) { }

  fileChange(ev: any) {
    const files = ev.target.files
    this.loading = true
    this.sharedService
      .uploadFile(files[0])
      .pipe(takeUntil(this.destroySubject.asObservable()))
      .subscribe(
        filename => {
          this.loading = false
          this.imageUrl = `${environment.imageBaseURL}${filename}`
          this.onChange(filename)
          this.notify.success(`上传文件成功`, `恭喜您，上传文件成功！`)
        },
        e => {
          this.loading = false
          this.notify.error(
            `上传文件失败`,
            e.message
          )
        }
      )
  }

  ngOnDestroy(): void {
    this.destroySubject.next()
    this.destroySubject.complete()
    if (this.loading) {
      this.message.info(`取消上传文件`)
    }
  }

  toPreview(tmp: TemplateRef<any>) {
    // this.dialogRef = this.dialog.open(tmp)
    // this.modalService.open({content: tmp})

    this.message.info(`预览`)
  }

  toDelete() {
    this.imageUrl = ''
    this.onChange('')
  }

  closeDialog() {
    // this.dialogRef.close()
  }

  writeValue(filename: string): void {
    if (filename) {
      this.imageUrl = `${environment.imageBaseURL}${filename}`
    } else {
      this.imageUrl = ''
    }
  }
  registerOnChange(fn: any): void {
    this.onChange = fn
  }
  registerOnTouched(fn: any): void {
    // noop
  }
  setDisabledState?(isDisabled: boolean): void {
    // noop
  }
}