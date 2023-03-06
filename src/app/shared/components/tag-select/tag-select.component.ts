import {
  Component,
  StaticProvider,
  forwardRef,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Tag, TagTypes } from '../../models';
import { TagService } from '../../services';


export const TAG_SELECT_VALUE_ACCESSOR: StaticProvider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TagSelectComponent),
  multi: true
};

@Component({
  selector: 'tag-select',
  templateUrl: './tag-select.component.html',
  styles: [
    `.ant-tag-checkable {
      border-color: #1890ff;
    }`
  ],
  providers: [TAG_SELECT_VALUE_ACCESSOR]
})
export class TagSelectComponent implements ControlValueAccessor, OnDestroy {
  private onChange: Function | null = null;

  selectedTags: Tag[] = [];
  allTags: Tag[] = [];

  selectTagsModalVisible = false;
  manageTagsModalVisible = false;
  tagInputCtrl = new FormControl(null);

  @Input() type: TagTypes = TagTypes.FOLLOWED_PROJECT_CATEGORY

  @Input() mode: 'view' | 'edit' = 'edit';

  @ViewChild('inputAdd') inputAdd: ElementRef | null = null

  constructor(
    private readonly tagService: TagService,
    private readonly messageService: NzMessageService,
    private readonly notificationService: NzNotificationService
  ) { }

  showSelectTagsModal(): void {
    this.selectTagsModalVisible = true;
    this.fetchAllTags();
  }

  hasSelectedTag(tag: Tag): boolean {
    return this.selectedTags.findIndex(e => e._id === tag._id) >= 0
  }

  tagSelectChange(selected: boolean, tag: Tag) {
    // console.log(`tagSelectChange: selected ${selected}, tag: `, tag)
    if (selected) {
      const theTag = this.selectedTags.find(e => e._id === tag._id);
      if (!theTag) {
        this.selectedTags = [...this.selectedTags, tag]
      }
    } else {
      this.selectedTags = this.selectedTags.filter(e => e._id !== tag._id)
    }

    this.emitValue();
  }

  showManageTagsModal(): void {
    this.manageTagsModalVisible = true;

    setTimeout(() => {
      if (this.inputAdd) {
        this.inputAdd.nativeElement.focus();
      }
    }, 500)
  }

  toAddTag() {
    if (!this.tagInputCtrl.value) {
      this.messageService.info(`还没有填写标签`)
      return
    }

    this.tagService.create({ type: this.type, text: this.tagInputCtrl.value })
      .subscribe({
        next: () => {
          this.notificationService.success(`添加标签成功`, `添加标签成功`);
          this.tagInputCtrl.patchValue(null)
          this.fetchAllTags();
        },
        error: (err: Error) => {
          this.notificationService.error(`添加标签失败`, `${err.message}`)
        }
      })
  }

  onDeleteTag(tag: Tag) {
    this.tagService.deleteByID(tag._id)
      .subscribe({
        next: () => {
          this.notificationService.success(`删除标签成功`, `删除标签成功`);
          this.fetchAllTags();
          this.selectedTags = this.selectedTags.filter(e => e._id !== tag._id);
          this.emitValue();
        },
        error: (err: Error) => {
          this.notificationService.error(`删除标签失败`, `${err.message}`)
        }
      })
  }

  emitValue() {
    // console.log(`emitValue() tags: `, this.selectedTags)
    if (this.onChange) {
      this.onChange(this.selectedTags.map(e => e._id))
    }
  }

  ngOnDestroy(): void { }

  writeValue(tagIDs: string[]): void {
    if (tagIDs && Array.isArray(tagIDs)) {
      this.fetchAllTags()
        .then((tags) => {
          this.selectedTags = tags.filter(e => {
            return tagIDs.indexOf(e._id) >= 0
          })
        })
    } else {
      this.selectedTags = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // noop
  }
  setDisabledState?(isDisabled: boolean): void {
    // noop
  }

  private async fetchAllTags(): Promise<Tag[]> {
    const self = this;
    return new Promise((resolve, reject) => {
      this.tagService.queryList({ type: this.type })
        .subscribe({
          next(tags: Tag[]) {
            self.allTags = tags.sort((a, b) => {
              if (a.text < b.text) {
                return -1;
              } else if (a.text > b.text) {
                return 1;
              } else {
                return 0
              }
            });
            resolve(tags)
          },
          error(err: Error) {
            reject(err)
          }
        })
    })
  }
}