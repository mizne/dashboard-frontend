import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

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

  constructor() {
    this.restoreState();
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
    }

    if (wallet === 'walletconnect') {
      const wcProvider = await EthereumProvider.init({
        projectId: 'a344e88ccfa50d0aaa75417a6fba6388', // 去 WalletConnect Cloud 申请
        chains: [chainConfig.chainId],
        rpcMap: { [chainConfig.chainId]: chainConfig.rpcUrl },
        showQrModal: true
      });
      await wcProvider.enable();

      this.provider = new ethers.BrowserProvider(wcProvider as any);
      this.wcProvider = wcProvider;

      this.signer = await this.provider.getSigner();
      this.address = await this.signer.getAddress();
      this.connectedWallet = 'walletconnect';
    }

    this.saveState();
  }

  disconnect() {
    if (this.connectedWallet === 'walletconnect') {
      this.wcProvider?.disconnect();
      this.wcProvider = undefined;
    }

    this.provider = undefined;
    this.signer = undefined;
    this.address = null;
    this.connectedWallet = null;
    localStorage.removeItem('walletState');
  }
}
