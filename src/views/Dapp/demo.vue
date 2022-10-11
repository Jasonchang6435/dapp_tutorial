<template>
  <h4>MeteMask/WalletConnet 简明教程</h4>

  <h4>MeteMask 在 opensea mint NFT</h4>
  <div class="step">
    <button type="button" @click="checkWalletExist">
      第一步 检查是否安装 MeteMask
    </button>
    <span>是否安装: {{ metemaskInstalled }}</span>
  </div>
  <div class="step">
    <div>
      <button type="button" @click="checkChainID">
        第二步 检查当前 chainID
      </button>
      <span>network: {{ network }}</span>
    </div>
    <div>
      <button type="button" @click="checkAddress">获取钱包地址</button>
      <span>address: {{ address }}</span>
    </div>
  </div>
  <div class="step">
    <button type="button" @click="trySwitchOrSetNetwork">
      第三步 切换到 Rinkeby
    </button>
    <span>由于测试的合约地址在 Rinkeby 所以切换网络 不存在自动添加网络</span>
  </div>
  <div class="step">
    <button type="button" @click="claimNFT">
      第四步 调用 abi 领取一个测试网的 NFT
    </button>
  </div>
</template>

<script setup lang="ts">
/*
基础概念
1. 钱包 保存私钥 公钥对 地址等信息的存储媒介 主流插件钱包 Metamask(小狐狸)
WalletConnect 硬件钱包等等
2. provider 对访问标准以太坊节点网络数据的抽象
   一般 provider 是第三方的钱包 (如小狐狸)提供全局对象 通过 ethers js 或者 web3 js 构造的

*/

/*

MeteMask 最佳实践

1, basic usage
Detect the Ethereum provider (window.ethereum)
Detect which Ethereum network the user is connected to
Get the user's Ethereum account(s)

*/

import { ethers } from "ethers";
import threeDXAbi from "@/api/ThreeDX.json";
import { ThreeDX_Contract_Address } from "@/utils/globalConfig.json";
import { pinJSONToIPFS } from "@/api/ipfs";
import { ref } from "vue";
import { MetaMaskError } from "@/core/types/metamask";

const metemaskInstalled = ref<boolean>(false);
const network = ref<string>("");
const address = ref<string[]>([]);

const checkWalletExist = () => {
  metemaskInstalled.value = Boolean(window.ethereum);
};

const checkChainID = async () => {
  const chainMap = {
    "0x1": "Ethereum Main Network (Mainnet)",
    "0x3": "Ropsten Test Network",
    "0x4": "Rinkeby Test Network",
    "0x5": "Goerli Test Network",
    "0x2a": "Kovan Test Network",
  };
  const id = await window.ethereum.request({ method: "eth_chainId" });
  network.value = chainMap[id];
};

const checkAddress = async () => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  address.value = accounts.join(",");
};

const trySwitchOrSetNetwork = async () => {
  const chain = {
    chainId: "0x4",
    chainName: "Rinkeby Test NetWork",
    ChainLabel: "Rinkeby Test NetWork",
    RpcUrl: "https://rinkeby.infura.io/v3/",
    chainIcon: "",
    contractAddr: "",
    ExplorerUrl: "https://rinkeby.etherscan.io",
    Data: {
      name: "rinkeby",
      symbol: "RinkebyETH",
      decimals: 18,
    },
  };
  const provider = window.ethereum;
  const chainIdHex = "0x4";
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (switchError) {
    // ChainNotFound Error
    if ((switchError as MetaMaskError).code === "4092") {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: chain.ChainLabel,
              rpcUrls: [chain.RpcUrl],
              blockExplorerUrls: [chain.ExplorerUrl],
              nativeCurrency: {
                name: chain.Data.name,
                symbol: chain.Data.symbol,
                decimals: chain.Data.decimals,
              },
            },
          ],
        });
      } catch (e) {
        throw new Error("chain_mismatch");
      }
    } else {
      throw new Error("chain_mismatch");
    }
  }
};

const mintPayload = () => {
  // do not change
  // return {"image":"ipfs://QmXnLt5H1zzpmAKzq8xVVuhgSt6gNvGPfat5P53bPEqi8o","animation_url":"ipfs://QmTv2TgyUVjhqMXEev38S67jzGXpGrpTDMgp9PFaCCTBP9/DamagedHelmet.gltf","royalty":20,"model":"xxx"}
  // QmS26mHuiCK9oBT53nw2haGW3qvV8qzyTDUUVH2A47Tkvw
  return {
    name: "Mint a test NFT",
    description: "generate by a rinkeby dapp",
    image: "ipfs://QmXnLt5H1zzpmAKzq8xVVuhgSt6gNvGPfat5P53bPEqi8o",
    animation_url:
      "ipfs://QmTv2TgyUVjhqMXEev38S67jzGXpGrpTDMgp9PFaCCTBP9/DamagedHelmet.gltf",
    royalty: 20,
    model: "xxx",
  };
};

const claimNFT = async () => {
  // make a hash for mint
  const p = mintPayload();
  const hash = await pinJSONToIPFS(p);
  // threeDXAbi.abi 就是这个合约的接口
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const threeDXContact = new ethers.Contract(
      ThreeDX_Contract_Address,
      threeDXAbi.abi,
      provider
    ).connect(signer);
    const tx = await threeDXContact.mint(hash);
    // tx.wait();
    console.log("debug tx", tx);
  } catch (error) {
    console.log("debug mint error", error);
  }
};
</script>

<style scoped lang="scss">
button {
  display: inline-block;
  text-align: center;
  padding: 0px 30px;
  line-height: 38px;
  color: #000;
  border: 1px solid #00ffa3;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
}

div {
  & + & {
    margin-top: 20px;
  }
}
</style>
