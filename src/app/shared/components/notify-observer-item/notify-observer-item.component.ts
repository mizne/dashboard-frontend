import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NotifyObserver, NotifyObserverTypes } from '../../models';

interface TableItem extends NotifyObserver {
  enableTrackingCtrl: FormControl;
  followedProjectIDCtrl?: FormControl;
}

@Component({
  selector: 'notify-observer-item',
  templateUrl: 'notify-observer-item.component.html'
})

export class NotifyObserverItemComponent implements OnInit {
  constructor() { }

  @Input() mode: 'small' | 'default' = 'default'

  @Input() width = 320;
  @Input() item: TableItem | null = null;

  @Output() update = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  ngOnInit() { }

  resolveHref(item: NotifyObserver) {
    switch (item.type) {
      case NotifyObserverTypes.MEDIUM:
        return item.mediumHomeLink
      case NotifyObserverTypes.MIRROR:
        return item.mirrorHomeLink
      case NotifyObserverTypes.TWITTER:
        return item.twitterHomeLink
      case NotifyObserverTypes.TWITTER_SPACE:
        return item.twitterSpaceHomeLink
      case NotifyObserverTypes.GALXE:
        return item.galxeHomeLink
      case NotifyObserverTypes.QUEST3:
        return item.quest3HomeLink
      case NotifyObserverTypes.TIMER:
        return item.timerNotifyShowUrl
      case NotifyObserverTypes.SNAPSHOT:
        return item.snapshotHomeLink
      case NotifyObserverTypes.GUILD:
        return item.guildHomeLink
      case NotifyObserverTypes.XIAOYUZHOU:
        return item.xiaoyuzhouHomeLink
      case NotifyObserverTypes.SOQUEST:
        return item.soQuestHomeLink
      case NotifyObserverTypes.SUBSTACK:
        return item.substackHomeLink
      default:
        console.warn(`resolveHref() unknown type: ${item.type}`)
        return ''
    }
  }

  resolveDesc(item: NotifyObserver) {
    switch (item.type) {
      case NotifyObserverTypes.MEDIUM:
        return item.mediumTitleKey
      case NotifyObserverTypes.MIRROR:
        return item.mirrorTitleKey
      case NotifyObserverTypes.TWITTER:
        return item.twitterTitleKey
      case NotifyObserverTypes.TWITTER_SPACE:
        return item.twitterSpaceTitleKey
      case NotifyObserverTypes.GALXE:
        return item.galxeTitleKey
      case NotifyObserverTypes.QUEST3:
        return item.quest3TitleKey
      case NotifyObserverTypes.TIMER:
        return `${item.timerNotifyShowDesc || ''} ${this.isNumberArray(item.timerMonth) ? `${item.timerMonth?.join(', ')}月 ` : ''}${this.isNumberArray(item.timerDate) ? ` ${item.timerDate?.join(', ')}日 ` : ''}${item.timerHour?.join(', ')}时 ${item.timerMinute?.join(', ')}分`
      case NotifyObserverTypes.SNAPSHOT:
        return item.snapshotTitleKey
      case NotifyObserverTypes.GUILD:
        return item.guildTitleKey
      case NotifyObserverTypes.XIAOYUZHOU:
        return item.xiaoyuzhouTitleKey
      case NotifyObserverTypes.SOQUEST:
        return item.soQuestTitleKey
      case NotifyObserverTypes.SUBSTACK:
        return item.substackTitleKey
      default:
        console.warn(`resolveDesc() unknown type: ${item.type}`)
        return ''
    }
  }

  confirmUpdate() {
    this.update.emit();
  }

  confirmDelete() {
    this.delete.emit();
  }

  private isNumberArray(v?: number[]): boolean {
    return Array.isArray(v) && v.length > 0 && v.every(f => typeof f === 'number')
  }

}