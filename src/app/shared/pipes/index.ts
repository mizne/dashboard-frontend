import { PercentPipe } from './percent.pipe';
import { ToFixedPipe } from './to-fixed.pipe';
import { LocaleStringPipe } from './locale-string.pipe';

export const pipes = [PercentPipe, ToFixedPipe, LocaleStringPipe];

export * from './percent.pipe';
export * from './to-fixed.pipe';
export * from './locale-string.pipe';
