export interface FundRaise {
  readonly _id: string;
  readonly investorName: string;
  readonly investDateStr: string;
  readonly investDate: number;
  readonly projectName: string;
  readonly projectWebsite: string;
  readonly projectHomeLink: string;
  readonly leadInvestor: string;
  readonly fundRound: string;
  readonly moneyRaised: string;
  readonly source: string;
  readonly createdAt: number;
  readonly createdAtStr: string;
}
