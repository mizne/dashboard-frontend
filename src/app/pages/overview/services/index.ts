import { CexTokenDailyService } from './cex-token-daily.service';
import { CexTokenTagDailyService } from './cex-token-tag-daily.service';
import { CexTokenService } from './cex-token.service';
import { CexTokenCacheService } from './cex-token-cache.service';
import { CexTokenTagService } from './cex-token-tag.service';

export const services = [
  CexTokenDailyService,
  CexTokenTagDailyService,
  CexTokenService,
  CexTokenCacheService,
  CexTokenTagService,
];
