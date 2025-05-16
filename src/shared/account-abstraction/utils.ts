import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { Signer } from "@zerodev/sdk/types";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { ZERODEV_RPC } from "./constants";

const bundlerTransport = http(ZERODEV_RPC);
// const publicClient = createPublicClient({
//   chain: baseSepolia,
//   transport: http(PUBLIC_RPC),
// });
const kernelPublicClient = createPublicClient({
  transport: bundlerTransport,
  chain: baseSepolia,
});
const kernelPaymasterClient = createZeroDevPaymasterClient({
  chain: baseSepolia,
  transport: http(ZERODEV_RPC),
});

export async function getKernelAccount(signer: Signer) {
  const simpleValidator = await signerToEcdsaValidator(kernelPublicClient, {
    signer,
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
  });
  const account = await createKernelAccount(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
    plugins: {
      sudo: simpleValidator,
    },
  });

  return account;
}

export async function getKernelAccountClient(signer: Signer) {
  const client = createKernelAccountClient({
    account: await getKernelAccount(signer),
    chain: baseSepolia,
    bundlerTransport: bundlerTransport,
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });
  return client;
}
