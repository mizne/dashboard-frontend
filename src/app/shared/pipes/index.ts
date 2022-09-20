import { PercentPipe } from './percent.pipe';
import { ToFixedPipe } from './to-fixed.pipe';
import { LocaleStringPipe } from './locale-string.pipe';
import { VolumePipe } from './volume.pipe';
import { EMACompressionsStringPipe } from './ema-compressions-string.pipe';

export const pipes = [
  PercentPipe,
  ToFixedPipe,
  LocaleStringPipe,
  VolumePipe,
  EMACompressionsStringPipe,
];

export * from './percent.pipe';
export * from './to-fixed.pipe';
export * from './locale-string.pipe';
export * from './volume.pipe';
export * from './ema-compressions-string.pipe';
