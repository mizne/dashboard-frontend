export interface FundRaise {
  readonly _id: string;
  investorName: string;
  investDateStr: string;
  investDate: number;
  projectName: string;
  projectWebsite: string;
  projectHomeLink: string;
  leadInvestor: string;
  fundRound: string;
  moneyRaised: string;
  source: string;
  readonly createdAt: number;
  readonly createdAtStr: string;
}
