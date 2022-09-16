import { Injectable } from '@angular/core';
import { filter, Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

interface ClientNotifyNewlyCoinData {
  type: 'newly-coin';
  payload: { name: string; symbol: string };
}

export type ClientNotifyData = ClientNotifyNewlyCoinData;

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

    this.socket = io(environment.baseURL);

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

  listenNewlyCoin(): Observable<ClientNotifyData> {
    return this.subject
      .asObservable()
      .pipe(filter((e) => e.type === 'newly-coin'));
  }
}
