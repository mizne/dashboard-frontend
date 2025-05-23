import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

interface ClientNotifyNewlyCoinData {
  type: 'newly-coin';
  payload: { name: string; symbol: string };
}

interface ClientNotifyTaskCompleteData {
  type: 'task-complete';
  payload: { desc: string };
}

interface ClientNotifyTaskErrorData {
  type: 'task-error';
  payload: { desc: string };
}

interface ClientNotifyObserverData {
  type: 'notify-observer';
  payload: { title: string; desc: string; link?: string; icon?: string; };
}

interface ClientNotifyRunningTasksData {
  type: 'running-tasks';
  payload: {
    tasks: Array<{
      id: string;
      name: string;
      key: string;
      priority: number;
      progress: string;
      startAt: number;
      remark?: string;
    }>
  };
}

export type ClientNotifyData =
  | ClientNotifyNewlyCoinData
  | ClientNotifyTaskCompleteData
  | ClientNotifyTaskErrorData
  | ClientNotifyObserverData
  | ClientNotifyRunningTasksData;

@Injectable({ providedIn: 'root' })
export class ClientNotifyService {
  private socket: Socket | null = null;
  private readonly subject = new Subject<ClientNotifyData>();

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    if (this.socket) {
      return;
    }

    this.socket = io(environment.baseURL, {
      auth: { token: 'DashboardFrontend' },
    });

    this.socket.on('connect', () => {
      console.log('[WebsocketService] Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[WebsocketService] Disconnected');
    });

    this.socket.on('server-notify', (data: ClientNotifyData) => {
      console.log(`[WebsocketService] server-notify `, data);
      this.subject.next(data);
    });
  }

  markIdentity() {
    if (!this.socket) {
      return
    }

    this.socket.emit('identity', this.socket.id)
  }

  listenNewlyCoin(): Observable<ClientNotifyNewlyCoinData> {
    return this.subject
      .asObservable()
      .pipe(
        filter((e) => e.type === 'newly-coin')
      ) as Observable<ClientNotifyNewlyCoinData>;
  }

  listenTaskComplete(): Observable<ClientNotifyTaskCompleteData> {
    return this.subject
      .asObservable()
      .pipe(
        filter((e) => e.type === 'task-complete')
      ) as Observable<ClientNotifyTaskCompleteData>;
  }

  listenTaskError(): Observable<ClientNotifyTaskErrorData> {
    return this.subject
      .asObservable()
      .pipe(
        filter((e) => e.type === 'task-error')
      ) as Observable<ClientNotifyTaskErrorData>;
  }

  listenNotifyObserver(): Observable<ClientNotifyObserverData> {
    return this.subject
      .asObservable()
      .pipe(
        filter((e) => e.type === 'notify-observer')
      ) as Observable<ClientNotifyObserverData>;
  }

  listenRunningTasks(): Observable<ClientNotifyRunningTasksData> {
    return this.subject
      .asObservable()
      .pipe(
        filter((e) => e.type === 'running-tasks')
      ) as Observable<ClientNotifyRunningTasksData>;
  }
}
