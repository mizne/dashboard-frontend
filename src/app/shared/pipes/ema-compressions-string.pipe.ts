import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emaCompressionsString',
})
export class EMACompressionsStringPipe implements PipeTransform {
  transform(
    emaCompressions: Array<{
      token: string;
      closeDeltaEma21: number;
      ema21DeltaEma55: number;
      ema55DeltaEma144: number;
      emaCompressionRelative: number;
    }>
  ): string {
    if (Array.isArray(emaCompressions) && emaCompressions.length > 0) {
      const statusGen = (
        closeDeltaEma21: number,
        ema21DeltaEma55: number,
        ema55DeltaEma144: number,
        emaCompressionRelative: number
      ) => {
        const status =
          closeDeltaEma21 >= 0 && ema21DeltaEma55 >= 0 && ema55DeltaEma144 >= 0
            ? 'long'
            : closeDeltaEma21 < 0 && ema21DeltaEma55 < 0 && ema55DeltaEma144 < 0
            ? 'short'
            : 'shock';
        return {
          status: status,
          compression: emaCompressionRelative <= 0.1,
        };
      };

      const all = emaCompressions.map((e) =>
        statusGen(
          e.closeDeltaEma21,
          e.ema21DeltaEma55,
          e.ema55DeltaEma144,
          e.emaCompressionRelative
        )
      );
      const longCount = all.filter((e) => e.status === 'long').length;
      const longAndCompressionCount = all.filter(
        (e) => e.status === 'long' && e.compression
      ).length;

      const shortCount = all.filter((e) => e.status === 'short').length;
      const shortAndCompressionCount = all.filter(
        (e) => e.status === 'short' && e.compression
      ).length;

      const shockCount = all.filter((e) => e.status === 'shock').length;
      const shockAndCompressionCount = all.filter(
        (e) => e.status === 'shock' && e.compression
      ).length;

      return `多头 ${longCount}(${longAndCompressionCount}密集) / 空头 ${shortCount}(${shortAndCompressionCount}密集) /  震荡 ${shockCount}(${shockAndCompressionCount}密集)`;
    } else {
      return '--';
    }
  }
}
