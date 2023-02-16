import { CexTokenDailyService } from './cex-token-daily.service';
import { CexTokenTagDailyService } from './cex-token-tag-daily.service';
import { CexTokenService } from './cex-token.service';
import { CexTokenCacheService } from './cex-token-cache.service';
import { CexTokenTagCacheService } from './cex-token-tag-cache.service';
import { CexTokenTagService } from './cex-token-tag.service';
import { CexTokenAlertService } from './cex-token-alert.service';
import { CexTokenTagAlertService } from './cex-token-tag-alert.service';

export const services = [
  CexTokenDailyService,
  CexTokenTagDailyService,
  CexTokenService,
  CexTokenCacheService,
  CexTokenTagCacheService,
  CexTokenTagService,
  CexTokenAlertService,
  CexTokenTagAlertService,
];
