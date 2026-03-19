import {
  fetchCallReadOnlyFunction,
  fetchAbi,
  cvToValue,
  uintCV,
  intCV,
  boolCV,
  stringAsciiCV,
  stringUtf8CV,
  standardPrincipalCV,
  bufferCV,
  noneCV,
  someCV,
  ClarityValue,
} from "@stacks/transactions";
import { STACKS_MAINNET, STACKS_TESTNET } from "@stacks/network";
import type { ContractABI, FunctionArg } from "./types";

export function getNetwork(network: "mainnet" | "testnet") {
  return network === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;
}

export function getApiBase(network: "mainnet" | "testnet") {
  return network === "mainnet"
    ? "https://api.hiro.so"
    : "https://api.testnet.hiro.so";
}

export async function fetchContractABI(
  contractAddress: string,
  contractName: string,
  network: "mainnet" | "testnet",
): Promise<ContractABI> {
  const abi = await fetchAbi({
    contractAddress,
    contractName,
    url: getApiBase(network),
  });
  return abi as unknown as ContractABI;
}

export function buildClarityArg(type: string, value: string): ClarityValue {
  const t = type.toLowerCase();
  if (t === "uint128" || t === "uint") return uintCV(BigInt(value));
  if (t === "int128" || t === "int") return intCV(BigInt(value));
  if (t === "bool") return boolCV(value === "true");
  if (t === "principal") return standardPrincipalCV(value);
  if (t.startsWith("string-ascii")) return stringAsciiCV(value);
  if (t.startsWith("string-utf8")) return stringUtf8CV(value);
  if (t === "none") return noneCV();
  if (t.startsWith("optional") || t.startsWith("(optional")) {
    if (!value || value === "none") return noneCV();
    const inner = t
      .replace(/^\(optional\s+/, "")
      .replace(/\)$/, "")
      .trim();
    return someCV(buildClarityArg(inner, value));
  }
  if (t.startsWith("buffer") || t === "buff") {
    return bufferCV(Buffer.from(value, "hex"));
  }
  // fallback: try as string-ascii
  return stringAsciiCV(value);
}

export async function callReadOnly(
  contractAddress: string,
  contractName: string,
  functionName: string,
  args: FunctionArg[],
  argValues: Record<string, string>,
  network: "mainnet" | "testnet",
  senderAddress?: string,
) {
  const clarityArgs = args.map((a) =>
    buildClarityArg(a.type, argValues[a.name] ?? ""),
  );

  const result = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName,
    functionArgs: clarityArgs,
    network: getNetwork(network),
    senderAddress: senderAddress ?? contractAddress,
  });

  return cvToValue(result, true);
}
