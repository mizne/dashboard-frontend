import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FloorPrice } from '../models/floor-price.model';
import { Statistics } from '../models/statistics.model';
import { environment } from 'src/environments/environment';
import { isObject } from 'src/app/utils';

@Injectable()
export class NFTMarketplaceService {
  private baseURL = environment.baseURL;
  constructor(private httpClient: HttpClient) {}

  // TODO  如果某天没有数据（定时任务都失败） 都补0?
  fetchFloorPrices(
    projectName: string,
    chain: string,
    category: string,
    query: { [key: string]: any }
  ): Observable<FloorPrice[]> {
    return this.httpClient
      .get<FloorPrice[]>(
        `${
          this.baseURL
        }/floor-prices?projectName=${projectName}&chain=${chain}&category=${category}&${this.stringifyQuery(
          query
        )}`
      )
      .pipe(
        map((res) => {
          const groupedByTime: Array<{
            time: number;
            originalResults: FloorPrice[];
          }> = [];
          for (const m of res) {
            const theGroup = groupedByTime.find((e) => e.time === m.time);
            if (theGroup) {
              theGroup.originalResults.push(m);
            } else {
              groupedByTime.push({
                time: m.time,
                originalResults: [m],
              });
            }
          }
          return groupedByTime
            .sort((a, b) => a.time - b.time)
            .map((f) => {
              const sorted = f.originalResults.sort(
                (g, h) => g.createdAt - h.createdAt
              );
              return sorted[sorted.length - 1];
            });
        }),
        map((res) => {
          return res.map((e) => ({
            ...e,
            timeStr: e.timeStr.slice(5),
          }));
        })
      );
  }

  // TODO  如果某天没有数据（定时任务都失败） 都补0?
  fetchStatistics(
    projectName: string,
    chain: string,
    category: string,
    query: { [key: string]: any }
  ): Observable<Statistics[]> {
    return this.httpClient
      .get<Statistics[]>(
        `${
          this.baseURL
        }/statistics?projectName=${projectName}&chain=${chain}&category=${category}&${this.stringifyQuery(
          query
        )}`
      )
      .pipe(
        map((res) => {
          const groupedByTime: Array<{
            time: number;
            originalResults: Statistics[];
          }> = [];
          for (const m of res) {
            const theGroup = groupedByTime.find((e) => e.time === m.time);
            if (theGroup) {
              theGroup.originalResults.push(m);
            } else {
              groupedByTime.push({
                time: m.time,
                originalResults: [m],
              });
            }
          }
          return groupedByTime
            .sort((a, b) => a.time - b.time)
            .map((f) => {
              const sorted = f.originalResults.sort(
                (g, h) => g.createdAt - h.createdAt
              );
              return sorted[sorted.length - 1];
            });
        }),
        map((res) => {
          return res.map((e) => ({
            ...e,
            timeStr: e.timeStr.slice(5),
          }));
        })
      );
  }

  systemNotify(title: string, content: string) {
    const notification = new Notification(title, { body: content });
    return notification;
  }

  private stringifyQuery(obj: { [key: string]: any }): string {
    return Object.keys(obj)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(
            isObject(obj[key]) ? JSON.stringify(obj[key]) : obj[key]
          )}`
      )
      .join('&');
  }
}
