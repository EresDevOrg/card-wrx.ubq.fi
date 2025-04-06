import { defineChain } from "@reown/appkit/networks";

export const wirexPayChainTestnet = defineChain({
  id: 1001996,
  caipNetworkId: "eip155:1001996",
  chainNamespace: "eip155",
  name: "WirexPayChain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-dev.wirexpaychain.com"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://explorer-dev.wirexpaychain.com" },
  },
  contracts: {
    // Add the contracts here
  },
});

export const wirexPayChain = defineChain({
  id: 31415,
  caipNetworkId: "eip155:31415",
  chainNamespace: "eip155",
  name: "WirexPayChain",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.wirexpaychain.com"],
      webSocket: [],
    },
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://blockscout.wirexpaychain.com" },
  },
  contracts: {
    // Add the contracts here
  },
});
