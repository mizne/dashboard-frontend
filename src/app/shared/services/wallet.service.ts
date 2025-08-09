import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';
import {
  mwomStakeWithdrawContractAddressBNB,
  mwomStakeWithdrawContractABIBNB,
  mwomStakeWithdrawContractAddressArb,
  mwomStakeWithdrawContractABIArb,
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
  mwomSwapContract?: ethers.Contract

  mwomTokenBNB = '0x027a9d301FB747cd972CFB29A63f3BDA551DFc5c'
  mwomTokenArb = '0x509FD25EE2AC7833a017f17Ee8A6Fb4aAf947876'

  initWCProviderLoadingBehaviorSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)

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
      projectId: 'a344e88ccfa50d0aaa75417a6fba6388', // 去 WalletConnect Cloud 申请
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
    this.mwomSwapContract = undefined;
    localStorage.removeItem('walletState');
  }

  async withdrawMWOM(amountWei: bigint) {
    if (!this.mwomStakeWithdrawContract) {
      throw new Error(`请先连接钱包`)
    }

    if (this.selectedChain === 'bnb') {
      const tx = await this.mwomStakeWithdrawContract['withdraw'](this.mwomTokenBNB, amountWei);
      const receipt = await tx.wait();
      console.log('提现交易确认:', receipt.hash);
      return receipt;
    } else if (this.selectedChain === 'arbitrum') {
      const tx = await this.mwomStakeWithdrawContract['withdraw'](this.mwomTokenArb, amountWei);
      const receipt = await tx.wait();
      console.log('提现交易确认:', receipt.hash);
      return receipt;
    } else {
      this.notificationService.warning(`未知network`, `未知network`)
      return 0
    }

  }

  async getMWomStakedAmount(): Promise<number> {
    if (!this.mwomStakeWithdrawContract) {
      throw new Error(`请先连接钱包`)
    }

    if (this.selectedChain === 'bnb') {
      const [stakedAmount, availableAmount] = await this.mwomStakeWithdrawContract['stakingInfo'](this.mwomTokenBNB, this.address);
      const amount = ethers.formatUnits(stakedAmount, 18);

      return Number(amount)
    } else if (this.selectedChain === 'arbitrum') {
      const [stakedAmount, availableAmount] = await this.mwomStakeWithdrawContract['stakingInfo'](this.mwomTokenArb, this.address);
      const amount = ethers.formatUnits(stakedAmount, 18);

      return Number(amount)
    } else {
      this.notificationService.warning(`未知network`, `未知network`)
      return 0
    }
  }


  private initContract() {
    if (this.selectedChain === 'bnb') {
      this.mwomStakeWithdrawContract = new ethers.Contract(mwomStakeWithdrawContractAddressBNB, mwomStakeWithdrawContractABIBNB, this.signer);
    } else if (this.selectedChain === 'arbitrum') {
      this.mwomStakeWithdrawContract = new ethers.Contract(mwomStakeWithdrawContractAddressArb, mwomStakeWithdrawContractABIArb, this.signer);
    } else {
      this.notificationService.error(`未知network`, `未知network`)
    }
  }
}
