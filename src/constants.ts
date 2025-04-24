export const providersUrl: { [key: string]: string } = {
  1: "https://eth.drpc.org",
  31337: "http://127.0.0.1:8545",
  31415: "https://rpc.wirexpaychain.com",
  //230378335: "https://wirex-devnet-rpc.eu-north-2.gateway.fm",
  1001996: "https://rpc-dev.wirexpaychain.com",
};

export const explorersUrl: { [key: string]: string } = {
  1: "https://etherscan.io",
  31337: "http://127.0.0.1:8545",
  31415: "https://blockscout.wirexpaychain.com",
  //230378335: "https://wirex-devnet-blockscout.eu-north-2.gateway.fm",
  1001996: "https://explorer-dev.wirexpaychain.com",
};

export const backendBaseUrl = "";

export const wirexRegisterContractAddress: { [chainId: number]: string } = {
  1001996: "0x062AfB76614dd594A99e70fD2CfbDf417CCF8797",
  31415: "0x2766F66E572C94a4cbc57f4d5bd2aD71900edF30",
};
