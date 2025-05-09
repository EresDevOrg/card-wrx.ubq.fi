/* eslint-disable */
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { toPermissionValidator } from "@zerodev/permissions";
import { toSudoPolicy } from "@zerodev/permissions/policies";
import { toECDSASigner } from "@zerodev/permissions/signers";
import { createKernelAccount, createKernelAccountClient, createZeroDevPaymasterClient, KernelAccountClient, KernelV3_1AccountAbi } from "@zerodev/sdk";
import { getEntryPoint, KERNEL_V3_1, VALIDATOR_TYPE } from "@zerodev/sdk/constants";
import { concatHex, createPublicClient, createWalletClient, custom, EIP1193Provider, encodeFunctionData, http, pad, zeroAddress, zeroHash } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { accountsAbi } from "./accounts-abi";
import { contractRegistryAbi } from "./contract-registery-abi";

// RPC clients and RPC addresses
const PUBLIC_RPC = "https://sepolia.base.org";
const PAYMASTER_RPC = "https://rpc.zerodev.app/api/v3/90e0d1a0-884c-4bbd-a0d6-1a6740d4af9c/chain/84532?selfFunded=true";
const BUNDLER_RPC = "https://rpc.zerodev.app/api/v3/90e0d1a0-884c-4bbd-a0d6-1a6740d4af9c/chain/84532?selfFunded=true";

const bundlerTransport = http(BUNDLER_RPC);
const publicClient: any = createPublicClient({
  chain: baseSepolia,
  transport: http(PUBLIC_RPC),
});
const kernelPublicClient: any = createPublicClient({
  transport: bundlerTransport,
  chain: baseSepolia,
});
const kernelPaymasterClient: any = createZeroDevPaymasterClient({
  chain: baseSepolia,
  transport: http(PAYMASTER_RPC),
});

// As of now this is the current ContractRegistry address for Base Sepolia chain
const ContractRegistryAddress = "0x062AfB76614dd594A99e70fD2CfbDf417CCF8797";

// This is a unique identifier of your partner integration. It would be provided to you by Wirex Pay team
const PartnerId = "0x00000000000000000000000000000014";
// Privy flow, ConnectedWallet object is either an embedded wallet or an external waller linked during onboarding
export async function createAccountAbstraction_Privy(wasCreated: boolean) {
  let nativeProvider = window.ethereum;
  return await createAccountAbstraction_EIP1193Provider(nativeProvider as EIP1193Provider, wasCreated);
}

// EIP1193 flow. Provider should be a EIP1193 compatible object implementing all required functions.
export function createAccountAbstraction_EIP1193Provider(provider: EIP1193Provider, wasCreated: boolean) {
  if (!provider) {
    alert("No provider found");
    return;
  }
  const signer = createWalletClient({
    chain: baseSepolia,
    transport: custom(provider),
  });
  return createAccountAbstraction_Base(signer, wasCreated);
}

// Private key flow. The private key should be a valid private key hex string
export function createAccountAbstraction_PrivateKey(privateKey: `0x${string}`, wasCreated: boolean) {
  let mainWallet = privateKeyToAccount(privateKey);
  return createAccountAbstraction_Base(mainWallet, wasCreated);
}

export async function createAccountAbstraction_Base(signer: any, wasCreated: boolean): Promise<KernelAccountClient> {
  // Create an account client using the bare signer for connected wallet in order to retrieve its address.
  let simpleValidator = await createEcdsaValidator(signer);
  let account = await createKernelAccount(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
    plugins: {
      sudo: simpleValidator,
    },
  });
  console.log("Your Kernel Account Address:", account.address);
  let client = createKernelAccountClient({
    account: account,
    chain: baseSepolia,
    bundlerTransport: bundlerTransport,
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });

  // If this is a first creation than the AA has to be properly deployed on chain and required modules must be configured before Wirex Pay system can work with it.
  console.log("wasCreated", wasCreated);
  if (!wasCreated) {
    // Prepare call data for calls to install execution delay policy and funds management executor
    let executorCallData = await getInstallExecutorCallData(client.account.address);
    let policyCallData = await getInstallPolicyCallData(client.account.address, signer);
    let calls = await client.account!.encodeCalls([executorCallData, policyCallData]);

    // Execute install operations on the account abstraction. This would execute on-chain operation physically deploying AA contract and
    // installing required modules
    let trxHash = await client.sendUserOperation({
      callData: calls,
    });
    await client.waitForUserOperationReceipt({
      hash: trxHash,
      timeout: 30 * 1000,
    });
  }

  // Recreate AA client using its initial address and execution delay sudo policy
  let accountAddress = client.account.address;

  let validator = await createExecutionDelayValidator(signer);
  account = await createKernelAccount(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    address: accountAddress,
    kernelVersion: KERNEL_V3_1,
    plugins: {
      sudo: validator,
    },
  });

  client = createKernelAccountClient({
    account: account,
    chain: baseSepolia,
    bundlerTransport: bundlerTransport,
    paymaster: {
      getPaymasterData(userOperation) {
        return kernelPaymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });
  console.log("Your Kernel Account Address:", client.account.address);

  // If this is initial deployment than newly deployed AA must be registered in Wirex Pay Accounts contract.
  console.log("wasCreated2", wasCreated);
  if (!wasCreated) {
    // Create call data for registering in Wirex Pay Accounts contract
    let accountCreateCallData = await getAccountCreateCallData();
    let calls = await client.account!.encodeCalls([accountCreateCallData]);

    // Execute registration operations on the account abstraction.
    let trxHash = await client.sendUserOperation({
      callData: calls,
    });
    await client.waitForUserOperationReceipt({
      hash: trxHash,
      timeout: 30 * 1000,
    });
  }

  return client;
}

// Call data helper methods
async function getInstallExecutorCallData(targetWalletAddress: `0x${string}`) {
  let initData = concatHex([zeroAddress, zeroHash]);

  let executorAddress = (await publicClient.readContract({
    address: ContractRegistryAddress,
    abi: contractRegistryAbi, // Can be retrieved using block explorer of your liking
    functionName: "contractByName",
    args: ["FundsManagement"],
  })) as `0x${string}`;
  let data = encodeFunctionData({
    abi: KernelV3_1AccountAbi,
    functionName: "installModule",
    args: [BigInt(2), executorAddress, initData],
  });
  return {
    to: targetWalletAddress,
    value: BigInt(0),
    data: data,
  };
}

async function getInstallPolicyCallData(targetWalletAddress: `0x${string}`, signer: any) {
  let policy = await createExecutionDelayValidator(signer);
  let rootValidatorId = concatHex([
    VALIDATOR_TYPE[policy.validatorType],
    pad(policy.getIdentifier(), {
      size: 20,
      dir: "right",
    }),
  ]);
  let data = encodeFunctionData({
    abi: KernelV3_1AccountAbi,
    functionName: "changeRootValidator",
    args: [rootValidatorId, zeroAddress, await policy.getEnableData(targetWalletAddress), "0x"],
  });
  return {
    to: targetWalletAddress,
    value: BigInt(0),
    data: data,
  };
}

export async function getAccountCreateCallData() {
  let accountsAddress = (await publicClient.readContract({
    address: ContractRegistryAddress,
    abi: contractRegistryAbi, // Can be retrieved using block explorer of your liking
    functionName: "contractByName",
    args: ["Accounts"],
  })) as `0x${string}`;

  let data = encodeFunctionData({
    abi: accountsAbi, // Can be retrieved using block explorer of your liking
    functionName: "createUserAccountWithWallet",
    args: [PartnerId],
  });
  return {
    to: accountsAddress,
    value: BigInt(0),
    data: data,
  };
}

// Validator objects helpers
function createEcdsaValidator(signer: any) {
  return signerToEcdsaValidator(kernelPublicClient, {
    signer,
    entryPoint: getEntryPoint("0.7"),
    kernelVersion: KERNEL_V3_1,
  });
}

async function createExecutionDelayValidator(signer: any) {
  let policyAddress = (await publicClient.readContract({
    address: ContractRegistryAddress,
    abi: contractRegistryAbi, // Can be retrieved using block explorer of your liking
    functionName: "contractByName",
    args: ["ExecutionDelayPolicy"],
  })) as `0x${string}`;
  const rootPolicy = toSudoPolicy({
    policyAddress,
  });

  let res = await toPermissionValidator(kernelPublicClient, {
    entryPoint: getEntryPoint("0.7"),
    signer: await toECDSASigner({ signer: signer }),
    kernelVersion: KERNEL_V3_1,
    policies: [rootPolicy],
  });

  res.address = policyAddress;
  return res;
}
