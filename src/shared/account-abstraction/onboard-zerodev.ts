import { KernelV3_1AccountAbi } from "@zerodev/sdk";
import { VALIDATOR_TYPE } from "@zerodev/sdk/constants";
import { concatHex, encodeFunctionData, pad, zeroAddress, zeroHash } from "viem";
import { accountsAbi } from "./accounts-abi";
import { contractRegistryAddress, partnerId } from "./constants";
import { contractRegistryAbi } from "./contract-registry-abi";
import { createExecutionDelayValidator, getClientWithDelayPolicy, getEip1193Provider, getKernelAccountClient, publicClient } from "./utils";
import { Signer } from "@zerodev/sdk/types";
import { showToast } from "../../components/toaster";

export async function setupAccountAbstraction() {
  const signer = getEip1193Provider();
  let client = await getKernelAccountClient(signer);
  // Prepare call data for calls to install execution delay policy and funds management executor
  const executorCallData = await getInstallExecutorCallData(client.account.address);
  const policyCallData = await getInstallPolicyCallData(client.account.address, signer);
  const calls = await client.account.encodeCalls([executorCallData, policyCallData]);

  showToast({
    message: "Sign message to create your smart account.",
    type: "info",
  });
  // Execute install operations on the account abstraction. This would execute on-chain operation physically deploying AA contract and
  // installing required modules
  const trxHash = await client.sendUserOperation({
    callData: calls,
  });
  await client.waitForUserOperationReceipt({
    hash: trxHash,
    timeout: 30 * 1000,
  });
  console.log("Account abstraction deployed successfully. Attaching to wirex now.");

  client = await getClientWithDelayPolicy(client.account.address);

  // Create call data for registering in Wirex Pay Accounts contract
  const accountCreateCallData = await getAccountCreateCallData();
  const callsAccountCreate = await client.account.encodeCalls([accountCreateCallData]);

  showToast({
    message: "Sign message to register your smart account with UbiquiCard.",
    type: "info",
  });
  // Execute registration operations on the account abstraction.
  const trxHashAccountCreate = await client.sendUserOperation({
    callData: callsAccountCreate,
  });
  await client.waitForUserOperationReceipt({
    hash: trxHash,
    timeout: 30 * 1000,
  });

  console.log(`Account registered in Wirex Pay Accounts contract successfully. trxHashAccountCreate:${trxHashAccountCreate}`);

  showToast({
    message: "Your smart account has been registered with UbiquiCard successfully.",
    type: "success",
  });
  return client.account.address;
}

async function getInstallExecutorCallData(targetWalletAddress: `0x${string}`) {
  const initData = concatHex([zeroAddress, zeroHash]);

  const executorAddress = (await publicClient.readContract({
    address: contractRegistryAddress,
    abi: contractRegistryAbi, // Can be retrieved using block explorer of your liking
    functionName: "contractByName",
    args: ["FundsManagement"],
  })) as `0x${string}`;
  const data = encodeFunctionData({
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

async function getInstallPolicyCallData(targetWalletAddress: `0x${string}`, signer: Signer) {
  const policy = await createExecutionDelayValidator(signer);
  const rootValidatorId = concatHex([
    VALIDATOR_TYPE[policy.validatorType],
    pad(policy.getIdentifier(), {
      size: 20,
      dir: "right",
    }),
  ]);
  const data = encodeFunctionData({
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
  const accountsAddress = (await publicClient.readContract({
    address: contractRegistryAddress,
    abi: contractRegistryAbi, // Can be retrieved using block explorer of your liking
    functionName: "contractByName",
    args: ["Accounts"],
  })) as `0x${string}`;

  const data = encodeFunctionData({
    abi: accountsAbi, // Can be retrieved using block explorer of your liking
    functionName: "createUserAccountWithWallet",
    args: [partnerId],
  });
  return {
    to: accountsAddress,
    value: BigInt(0),
    data: data,
  };
}
