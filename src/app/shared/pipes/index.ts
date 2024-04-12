import { PercentPipe } from './percent.pipe';
import { ToFixedPipe } from './to-fixed.pipe';
import { LocaleStringPipe } from './locale-string.pipe';
import { VolumePipe } from './volume.pipe';
import { CreatedAtPipe } from './created-at.pipe';
import { EMACompressionsStringPipe } from './ema-compressions-string.pipe';
import { AirdropStatusStringPipe } from './airdrop-status-string.pipe';
import { AirdropStatusColorPipe } from './airdrop-status-color.pipe';

export const pipes = [
  PercentPipe,
  ToFixedPipe,
  LocaleStringPipe,
  VolumePipe,
  CreatedAtPipe,
  EMACompressionsStringPipe,
  AirdropStatusStringPipe,
  AirdropStatusColorPipe,
];

export * from './percent.pipe';
export * from './to-fixed.pipe';
export * from './locale-string.pipe';
export * from './volume.pipe';
export * from './created-at.pipe';
export * from './ema-compressions-string.pipe';
export * from './airdrop-status-string.pipe';
export * from './airdrop-status-color.pipe';
