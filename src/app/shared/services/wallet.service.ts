import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import {
  mwomStakeWithdrawContractAddressBNB,
  mwomStakeWithdrawContractABIBNB,
  mwomStakeWithdrawContractAddressArb,
  mwomStakeWithdrawContractABIArb,

  mwomTokenAddressBNB,
  mwomTokenABIBNB,
  mwomTokenAddressArb,
  mwomTokenABIArb,

  womTokenAddressBNB,
  womTokenABIBNB,
  womTokenAddressArb,
  womTokenABIArb,

  womMwomPreSwapContractAddressBNB,
  womMwomPreSwapContractABIBNB,
  womMwomSwapContractAddressBNB,
  womMwomSwapContractABIBNB,

  womMwomPreSwapContractAddressArb,
  womMwomPreSwapContractABIArb,
  womMwomSwapContractAddressArb,
  womMwomSwapContractABIArb,
} from '../models/blockchain-contract';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject } from 'rxjs';

export type SupportedWallet = 'metamask' | 'walletconnect';
export type SupportedChain = 'bnb' | 'arbitrum';

const CHAIN_CONFIG = {
  bnb: {
    chainId: 56,
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com'
  },
  arbitrum: {
    chainId: 42161,
    name: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io'
  }
};

// https://dashboard.reown.com/8ce9974f-eced-4d99-a387-e9a8188197bf/79bf96f4-d21a-4490-a105-51343e6e1604
const WALLETCONNECT_PROJECT_ID = 'a344e88ccfa50d0aaa75417a6fba6388'
@Injectable({
  providedIn: 'root'
})
export class WalletService {
  provider?: ethers.BrowserProvider;
  wcProvider?: EthereumProvider;
  signer?: ethers.Signer;
  address: string | null = null;
  connectedWallet: SupportedWallet | null = null;
  selectedChain: SupportedChain = 'bnb';

  mwomStakeWithdrawContract?: ethers.Contract
  womMwomSwapContract?: ethers.Contract

  initWCProviderLoadingBehaviorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  walletConnectStatus = new BehaviorSubject<boolean>(false)

  constructor(private readonly notificationService: NzNotificationService) {
    this.restoreState();
    this.initWCProvider();
  }

  private saveState() {
    localStorage.setItem('walletState', JSON.stringify({
      connectedWallet: this.connectedWallet,
      address: this.address,
      selectedChain: this.selectedChain
    }));
  }

  private restoreState() {
    const data = localStorage.getItem('walletState');
    if (data) {
      const parsed = JSON.parse(data);
      this.connectedWallet = parsed.connectedWallet;
      this.address = parsed.address;
      this.selectedChain = parsed.selectedChain || 'bnb';
    }
  }

  private initWCProvider() {
    this.initWCProviderLoadingBehaviorSubject.next(true)
    EthereumProvider.init({
      projectId: WALLETCONNECT_PROJECT_ID, // 去 WalletConnect Cloud 申请
      chains: [CHAIN_CONFIG.bnb.chainId, CHAIN_CONFIG.arbitrum.chainId],
      rpcMap: { [CHAIN_CONFIG.bnb.chainId]: CHAIN_CONFIG.bnb.rpcUrl, [CHAIN_CONFIG.arbitrum.chainId]: CHAIN_CONFIG.arbitrum.rpcUrl },
      showQrModal: true
    }).then(wcProvider => {
      this.initWCProviderLoadingBehaviorSubject.next(false)
      this.wcProvider = wcProvider;
      console.log(`this.wcProvider: `, this.wcProvider)
    }).catch(err => {
      this.notificationService.error(`初始化walletconnect失败`, `${err.message}`)
    })
  }

  setChain(chain: SupportedChain) {
    this.selectedChain = chain;
    this.saveState();
  }

  async connect(wallet: SupportedWallet) {
    const chainConfig = CHAIN_CONFIG[this.selectedChain];
    if (wallet === 'metamask') {
      if (!(window as any).ethereum) throw new Error('MetaMask 未安装');
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainConfig.chainId.toString(16) }]
      }).catch(async (err: any) => {
        if (err.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x' + chainConfig.chainId.toString(16),
              chainName: chainConfig.name,
              rpcUrls: [chainConfig.rpcUrl],
              blockExplorerUrls: [chainConfig.explorer],
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }
            }]
          });
        } else {
          throw err;
        }
      });
      this.provider = new ethers.BrowserProvider((window as any).ethereum);
      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.connectedWallet = 'metamask';
      this.initContract()
      this.walletConnectStatus.next(true)
    }

    if (wallet === 'walletconnect') {
      await this.wcProvider?.enable();
      await this.wcProvider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + chainConfig.chainId.toString(16) }]
      })
      this.provider = new ethers.BrowserProvider(this.wcProvider as any);
      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.connectedWallet = 'walletconnect';
      this.initContract()
      this.walletConnectStatus.next(true)
    }

    this.saveState();
  }

  disconnect() {
    this.wcProvider?.disconnect();
    // this.wcProvider = undefined;

    this.provider = undefined;
    this.signer = undefined;
    this.address = null;
    this.connectedWallet = null;
    this.mwomStakeWithdrawContract = undefined;
    this.womMwomSwapContract = undefined;
    localStorage.removeItem('walletState');
    this.walletConnectStatus.next(false)
  }

  async withdrawMwom(amountWei: bigint) {
    if (!this.mwomStakeWithdrawContract) {
      throw new Error(`请先连接钱包`)
    }

    if (this.selectedChain === 'bnb') {
      const tx = await this.mwomStakeWithdrawContract['withdraw'](mwomTokenAddressBNB, amountWei);
      const receipt = await tx.wait();
      console.log('withdrawMwom() 提现交易确认:', receipt.hash);
      return receipt;
    } else if (this.selectedChain === 'arbitrum') {
      const tx = await this.mwomStakeWithdrawContract['withdraw'](mwomTokenAddressArb, amountWei);
      const receipt = await tx.wait();
      console.log('withdrawMwom() 提现交易确认:', receipt.hash);
      return receipt;
    } else {
      this.notificationService.warning(`未知network`, `未知network`)
      return 0
    }

  }

  async getMwomStakedAmount(): Promise<number> {
    if (!this.mwomStakeWithdrawContract) {
      throw new Error(`请先连接钱包`)
    }

    if (this.selectedChain === 'bnb') {
      const [stakedAmount, availableAmount] = await this.mwomStakeWithdrawContract['stakingInfo'](mwomTokenAddressBNB, this.address);
      const amount = ethers.formatUnits(stakedAmount, 18);

      console.log(`getMwomStakedAmount() bnb amount: ${amount}`)

      return Number(amount)
    } else if (this.selectedChain === 'arbitrum') {
      const [stakedAmount, availableAmount] = await this.mwomStakeWithdrawContract['stakingInfo'](mwomTokenAddressArb, this.address);
      const amount = ethers.formatUnits(stakedAmount, 18);

      console.log(`getMwomStakedAmount() arbitrum amount: ${amount}`)

      return Number(amount)
    } else {
      this.notificationService.warning(`未知network提现`, `未知network提现`)
      return 0
    }
  }

  async depositMwom(amountWei: bigint) {
    if (!this.mwomStakeWithdrawContract) {
      throw new Error(`请先连接钱包`)
    }

    if (this.selectedChain === 'bnb') {
      const tx = await this.mwomStakeWithdrawContract['deposit'](mwomTokenAddressBNB, amountWei);
      const receipt = await tx.wait();
      console.log('depositMwom() 充值交易确认:', receipt.hash);
      return receipt;
    } else if (this.selectedChain === 'arbitrum') {
      const tx = await this.mwomStakeWithdrawContract['deposit'](mwomTokenAddressArb, amountWei);
      const receipt = await tx.wait();
      console.log('depositMwom() 充值交易确认:', receipt.hash);
      return receipt;
    } else {
      this.notificationService.warning(`未知network充值`, `未知network充值`)
      return 0
    }

  }

  async getMwomTokenBalance(): Promise<number> {
    if (!this.provider) throw new Error('钱包未连接');

    if (this.selectedChain === 'bnb') {
      // 1. 创建合约实例（只读，不需要 signer）
      const tokenContract = new ethers.Contract(mwomTokenAddressBNB, mwomTokenABIBNB, this.provider);

      // 2. 获取代币精度
      // const decimals = await tokenContract['decimals']();
      const decimals = 18;

      // 3. 获取余额
      const rawBalance = await tokenContract['balanceOf'](this.address);

      // 4. 格式化成人类可读格式
      const amount = Number(ethers.formatUnits(rawBalance, decimals));
      console.log(`getMwomTokenBalance() bnb decimals: ${decimals} amount: ${amount}`)
      return amount
    } else if (this.selectedChain === 'arbitrum') {
      // 1. 创建合约实例（只读，不需要 signer）
      const tokenContract = new ethers.Contract(mwomTokenAddressArb, mwomTokenABIArb, this.provider);

      // 2. 获取代币精度
      // const decimals = await tokenContract['decimals']();
      const decimals = 18;

      // 3. 获取余额
      const rawBalance = await tokenContract['balanceOf'](this.address);

      // 4. 格式化成人类可读格式
      const amount = Number(ethers.formatUnits(rawBalance, decimals));
      console.log(`getMwomTokenBalance() arbitrum decimals: ${decimals} amount: ${amount}`)
      return amount
    } else {
      this.notificationService.warning(`未知network`, `未知network`)
      return 0
    }


  }


  async getWomTokenBalance(): Promise<number> {
    if (!this.provider) throw new Error('钱包未连接');

    if (this.selectedChain === 'bnb') {
      // 1. 创建合约实例（只读，不需要 signer）
      const tokenContract = new ethers.Contract(womTokenAddressBNB, womTokenABIBNB, this.provider);

      // 2. 获取代币精度
      // const decimals = await tokenContract['decimals']();
      const decimals = 18;

      // 3. 获取余额
      const rawBalance = await tokenContract['balanceOf'](this.address);

      // 4. 格式化成人类可读格式
      const amount = Number(ethers.formatUnits(rawBalance, decimals));
      console.log(`getWomTokenBalance() bnb decimals: ${decimals} amount: ${amount}`)
      return amount
    } else if (this.selectedChain === 'arbitrum') {
      // 1. 创建合约实例（只读，不需要 signer）
      const tokenContract = new ethers.Contract(womTokenAddressArb, womTokenABIArb, this.provider);

      // 2. 获取代币精度
      // const decimals = await tokenContract['decimals']();
      const decimals = 18;

      // 3. 获取余额
      const rawBalance = await tokenContract['balanceOf'](this.address);

      // 4. 格式化成人类可读格式
      const amount = Number(ethers.formatUnits(rawBalance, decimals));
      console.log(`getWomTokenBalance() arbitrum decimals: ${decimals} amount: ${amount}`)
      return amount
    } else {
      this.notificationService.warning(`未知network`, `未知network`)
      return 0
    }
  }


  // // 预览swap后 拿到的token数量
  // async preSwapAmount(fromToken: string, toToken: string, fromAmount: number): Promise<number> {
  //   if (!this.provider) throw new Error('钱包未连接');

  //   if (this.selectedChain === 'bnb') {

  //     if (fromToken === womTokenAddressBNB && toToken === mwomTokenAddressBNB) {
  //       // wom -> mwom
  //       const amount = await this.preSwapAmountOfWom2MWomOnBNB(fromAmount)
  //       return amount
  //     } else if (fromToken === mwomTokenAddressBNB && toToken === womTokenAddressBNB) {
  //       // mwom -> wom
  //       return 0
  //     } else {
  //       return 0
  //     }

  //   } else if (this.selectedChain === 'arbitrum') {
  //     return 0
  //   } else {
  //     this.notificationService.warning(`未知network`, `未知network`)
  //     return 0
  //   }

  // }


  private initContract() {
    if (this.selectedChain === 'bnb') {
      this.mwomStakeWithdrawContract = new ethers.Contract(mwomStakeWithdrawContractAddressBNB, mwomStakeWithdrawContractABIBNB, this.signer);
      this.womMwomSwapContract = new ethers.Contract(womMwomSwapContractAddressBNB, womMwomSwapContractABIBNB, this.signer);
    } else if (this.selectedChain === 'arbitrum') {
      this.mwomStakeWithdrawContract = new ethers.Contract(mwomStakeWithdrawContractAddressArb, mwomStakeWithdrawContractABIArb, this.signer);
      this.womMwomSwapContract = new ethers.Contract(womMwomSwapContractAddressArb, womMwomSwapContractABIArb, this.signer);
    } else {
      this.notificationService.error(`未知network`, `未知network`)
    }
  }

  // bnb preswap wom -> mwom
  async preSwapAmountOfWom2MwomOnBNB(womAmount: number): Promise<number> {
    if (!this.provider) throw new Error('钱包未连接');
    console.log(`preSwapAmountOfWom2MwomOnBNB() womAmount: ${womAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    const womTokenContract = new ethers.Contract(womTokenAddressBNB, womTokenABIBNB, this.provider);
    // 2. 获取代币精度
    // const decimals = await womTokenContract['decimals']();
    const decimals = 18;
    const fromAmount = ethers.parseUnits(String(womAmount), decimals);

    const preSwapContract = new ethers.Contract(womMwomPreSwapContractAddressBNB, womMwomPreSwapContractABIBNB, this.provider);
    const result = await preSwapContract['quotePotentialSwap'](womTokenAddressBNB, mwomTokenAddressBNB, fromAmount);
    console.log(`preSwapAmountOfWom2MwomOnBNB() womAmount: ${womAmount} result: `, result)
    const mWomAmount = Number(ethers.formatUnits(result.potentialOutcome, decimals));
    console.log(`preSwapAmountOfWom2MwomOnBNB() womAmount: ${womAmount} mWomAmount: ${mWomAmount}`)
    return mWomAmount
  }

  // bnb preswap mwom -> wom
  async preSwapAmountOfMwom2WomOnBNB(mwomAmount: number): Promise<number> {
    if (!this.provider) throw new Error('钱包未连接');
    console.log(`preSwapAmountOfMwom2WomOnBNB() mwomAmount: ${mwomAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    const mwomTokenContract = new ethers.Contract(mwomTokenAddressBNB, mwomTokenABIBNB, this.provider);
    // 2. 获取代币精度
    // const decimals = await mwomTokenContract['decimals']();
    const decimals = 18;
    const fromAmount = ethers.parseUnits(String(mwomAmount), decimals);

    const preSwapContract = new ethers.Contract(womMwomPreSwapContractAddressBNB, womMwomPreSwapContractABIBNB, this.provider);
    const result = await preSwapContract['quotePotentialSwap'](mwomTokenAddressBNB, womTokenAddressBNB, fromAmount);
    console.log(`preSwapAmountOfMwom2WomOnBNB() mwomAmount: ${mwomAmount} result: `, result)
    const womAmount = Number(ethers.formatUnits(result.potentialOutcome, decimals));
    console.log(`preSwapAmountOfMwom2WomOnBNB() mwomAmount: ${mwomAmount} womAmount: ${womAmount}`)
    return womAmount
  }

  // arb preswap wom -> mwom
  async preSwapAmountOfWom2MwomOnArb(womAmount: number): Promise<number> {
    if (!this.provider) throw new Error('钱包未连接');
    console.log(`preSwapAmountOfWom2MwomOnArb() womAmount: ${womAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    const womTokenContract = new ethers.Contract(womTokenAddressArb, womTokenABIArb, this.provider);
    // 2. 获取代币精度
    // const decimals = await womTokenContract['decimals']();
    const decimals = 18;
    const fromAmount = ethers.parseUnits(String(womAmount), decimals);

    const preSwapContract = new ethers.Contract(womMwomPreSwapContractAddressArb, womMwomPreSwapContractABIArb, this.provider);
    const result = await preSwapContract['quotePotentialSwap'](womTokenAddressArb, mwomTokenAddressArb, fromAmount);
    console.log(`preSwapAmountOfWom2MwomOnArb() womAmount: ${womAmount} result: `, result)
    const mWomAmount = Number(ethers.formatUnits(result.potentialOutcome, decimals));
    console.log(`preSwapAmountOfWom2MwomOnArb() womAmount: ${womAmount} mWomAmount: ${mWomAmount}`)
    return mWomAmount
  }

  // arb preswap mwom -> wom
  async preSwapAmountOfMwom2WomOnArb(mwomAmount: number): Promise<number> {
    if (!this.provider) throw new Error('钱包未连接');
    console.log(`preSwapAmountOfMwom2WomOnArb() mwomAmount: ${mwomAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    const mwomTokenContract = new ethers.Contract(mwomTokenAddressArb, mwomTokenABIArb, this.provider);
    // 2. 获取代币精度
    // const decimals = await mwomTokenContract['decimals']();
    const decimals = 18;
    const fromAmount = ethers.parseUnits(String(mwomAmount), decimals);

    const preSwapContract = new ethers.Contract(womMwomPreSwapContractAddressArb, womMwomPreSwapContractABIArb, this.provider);
    const result = await preSwapContract['quotePotentialSwap'](mwomTokenAddressArb, womTokenAddressArb, fromAmount);
    console.log(`preSwapAmountOfMwom2WomOnArb() mwomAmount: ${mwomAmount} result: `, result)
    const womAmount = Number(ethers.formatUnits(result.potentialOutcome, decimals));
    console.log(`preSwapAmountOfMwom2WomOnArb() mwomAmount: ${mwomAmount} womAmount: ${womAmount}`)
    return womAmount
  }



  // bnb swap wom -> mwom
  async swapAmountOfWom2MwomOnBNB(womAmount: number, mwomAmount: number) {
    if (!this.womMwomSwapContract) {
      throw new Error(`请先连接钱包`)
    }
    console.log(`swapAmountOfWom2MwomOnBNB() womAmount: ${womAmount} mWomAmount: ${mwomAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    // const womTokenContract = new ethers.Contract(womTokenAddressBNB, womTokenABIBNB, this.provider);
    // const mWomTokenContract = new ethers.Contract(mwomTokenAddressBNB, mwomTokenABIBNB, this.provider);
    // 2. 获取代币精度
    // const decimals = await womTokenContract['decimals']();
    const decimals = 18;
    const amountIn = ethers.parseUnits(String(womAmount), decimals);
    const amountOut = ethers.parseUnits(String(mwomAmount), decimals);
    const deadlineInMin = 3;
    const deadline = Math.floor(Date.now() / 1000) + deadlineInMin * 60;
    const tx = await this.womMwomSwapContract['swapExactTokensForTokens'](
      [womTokenAddressBNB, mwomTokenAddressBNB],
      [womMwomPreSwapContractAddressBNB],
      amountIn,
      amountOut,
      this.address,
      deadline
    );
    const receipt = await tx.wait();
    console.log(`swapAmountOfWom2MwomOnBNB() womAmount: ${womAmount} mwomAmount: ${mwomAmount} hash:`, receipt.hash);
    return receipt;
  }


  // bnb swap mwom -> wom
  async swapAmountOfMwom2WomOnBNB(mwomAmount: number, womAmount: number) {
    if (!this.womMwomSwapContract) {
      throw new Error(`请先连接钱包`)
    }
    console.log(`swapAmountOfMwom2WomOnBNB() mwomAmount: ${mwomAmount} womAmount: ${womAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    // const womTokenContract = new ethers.Contract(womTokenAddressBNB, womTokenABIBNB, this.provider);
    // const mWomTokenContract = new ethers.Contract(mwomTokenAddressBNB, mwomTokenABIBNB, this.provider);
    // 2. 获取代币精度
    // const decimals = await womTokenContract['decimals']();
    const decimals = 18;
    const amountIn = ethers.parseUnits(String(mwomAmount), decimals);
    const amountOut = ethers.parseUnits(String(womAmount), decimals);
    const deadlineInMin = 3;
    const deadline = Math.floor(Date.now() / 1000) + deadlineInMin * 60;
    const tx = await this.womMwomSwapContract['swapExactTokensForTokens'](
      [mwomTokenAddressBNB, womTokenAddressBNB],
      [womMwomPreSwapContractAddressBNB],
      amountIn,
      amountOut,
      this.address,
      deadline
    );
    const receipt = await tx.wait();
    console.log(`swapAmountOfMwom2WomOnBNB() mwomAmount: ${mwomAmount} womAmount: ${womAmount} hash:`, receipt.hash);
    return receipt;
  }


  // arb swap wom -> mwom
  async swapAmountOfWom2MwomOnArb(womAmount: number, mwomAmount: number) {
    if (!this.womMwomSwapContract) {
      throw new Error(`请先连接钱包`)
    }
    console.log(`swapAmountOfWom2MwomOnArb() womAmount: ${womAmount} mwomAmount: ${mwomAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    // const womTokenContract = new ethers.Contract(womTokenAddressBNB, womTokenABIBNB, this.provider);
    // const mWomTokenContract = new ethers.Contract(mwomTokenAddressBNB, mwomTokenABIBNB, this.provider);
    // 2. 获取代币精度
    // const decimals = await womTokenContract['decimals']();
    const decimals = 18;
    const amountIn = ethers.parseUnits(String(womAmount), decimals);
    const amountOut = ethers.parseUnits(String(mwomAmount), decimals);
    const deadlineInMin = 3;
    const deadline = Math.floor(Date.now() / 1000) + deadlineInMin * 60;
    const tx = await this.womMwomSwapContract['swapExactTokensForTokens'](
      [womTokenAddressArb, mwomTokenAddressArb],
      [womMwomPreSwapContractAddressArb],
      amountIn,
      amountOut,
      this.address,
      deadline
    );
    const receipt = await tx.wait();
    console.log(`swapAmountOfWom2MwomOnArb() womAmount: ${womAmount} mwomAmount: ${mwomAmount} hash:`, receipt.hash);
    return receipt;
  }

  // arb swap mwom -> wom
  async swapAmountOfMwom2WomOnArb(mwomAmount: number, womAmount: number) {
    if (!this.womMwomSwapContract) {
      throw new Error(`请先连接钱包`)
    }
    console.log(`swapAmountOfMwom2WomOnArb() mwomAmount: ${mwomAmount} womAmount: ${womAmount}`)
    // 1. 创建合约实例（只读，不需要 signer）
    // const womTokenContract = new ethers.Contract(womTokenAddressBNB, womTokenABIBNB, this.provider);
    // const mWomTokenContract = new ethers.Contract(mwomTokenAddressBNB, mwomTokenABIBNB, this.provider);
    // 2. 获取代币精度
    // const decimals = await womTokenContract['decimals']();
    const decimals = 18;
    const amountIn = ethers.parseUnits(String(mwomAmount), decimals);
    const amountOut = ethers.parseUnits(String(womAmount), decimals);
    const deadlineInMin = 3;
    const deadline = Math.floor(Date.now() / 1000) + deadlineInMin * 60;
    const tx = await this.womMwomSwapContract['swapExactTokensForTokens'](
      [mwomTokenAddressArb, womTokenAddressArb],
      [womMwomPreSwapContractAddressArb],
      amountIn,
      amountOut,
      this.address,
      deadline
    );
    const receipt = await tx.wait();
    console.log(`swapAmountOfMwom2WomOnArb() mwomAmount: ${mwomAmount} womAmount: ${womAmount} hash:`, receipt.hash);
    return receipt;
  }

}
