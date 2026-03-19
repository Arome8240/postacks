"use client";

import { useState, useEffect } from "react";
import {
  Send2,
  Code,
  Save2,
  InfoCircle,
  CloseCircle,
  TickCircle,
  ArrowDown2,
} from "iconsax-react";
import type {
  ContractABI,
  ContractFunction,
  SavedRequest,
  Collection,
} from "@/lib/types";
import { fetchContractABI, callReadOnly } from "@/lib/stacks";

interface Props {
  initialRequest?: SavedRequest | null;
  collections: Collection[];
  onSave: (colId: string, req: Omit<SavedRequest, "id" | "createdAt">) => void;
}

export default function RequestPanel({
  initialRequest,
  collections,
  onSave,
}: Props) {
  const [contractAddress, setContractAddress] = useState("");
  const [contractName, setContractName] = useState("");
  const [network, setNetwork] = useState<"mainnet" | "testnet">("mainnet");
  const [abi, setAbi] = useState<ContractABI | null>(null);
  const [selectedFn, setSelectedFn] = useState<ContractFunction | null>(null);
  const [argValues, setArgValues] = useState<Record<string, string>>({});
  const [senderAddress, setSenderAddress] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingAbi, setLoadingAbi] = useState(false);
  const [loadingCall, setLoadingCall] = useState(false);
  const [saveColId, setSaveColId] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    if (!initialRequest) return;
    setContractAddress(initialRequest.contractAddress);
    setContractName(initialRequest.contractName);
    setNetwork(initialRequest.network);
    setArgValues(initialRequest.args);
    setAbi(null);
    setSelectedFn(null);
    setResult(null);
    setError(null);
  }, [initialRequest]);

  async function handleFetchAbi() {
    if (!contractAddress.trim() || !contractName.trim()) return;
    setLoadingAbi(true);
    setError(null);
    setAbi(null);
    setSelectedFn(null);
    try {
      const a = await fetchContractABI(
        contractAddress.trim(),
        contractName.trim(),
        network,
      );
      setAbi(a);
      const readOnly = a.functions.filter((f) => f.access === "read_only");
      if (readOnly.length > 0) {
        setSelectedFn(readOnly[0]);
        setArgValues({});
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingAbi(false);
    }
  }

  async function handleCall() {
    if (!selectedFn) return;
    setLoadingCall(true);
    setError(null);
    setResult(null);
    try {
      const val = await callReadOnly(
        contractAddress.trim(),
        contractName.trim(),
        selectedFn.name,
        selectedFn.args,
        argValues,
        network,
        senderAddress.trim() || undefined,
      );
      setResult(val);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoadingCall(false);
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!saveColId || !saveName.trim() || !selectedFn) return;
    onSave(saveColId, {
      name: saveName.trim(),
      contractAddress: contractAddress.trim(),
      contractName: contractName.trim(),
      functionName: selectedFn.name,
      args: argValues,
      network,
    });
    setSaveName("");
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 2000);
  }

  const readOnlyFns =
    abi?.functions.filter((f) => f.access === "read_only") ?? [];

  return (
    <div className="flex flex-col gap-4 p-6 max-w-3xl w-full mx-auto">
      {/* Contract section */}
      <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] flex items-center gap-2">
          <Code size={13} color="#7c5cfc" /> Contract
        </h2>

        {/* Network toggle */}
        <div className="flex gap-2">
          {(["mainnet", "testnet"] as const).map((n) => (
            <button
              key={n}
              onClick={() => setNetwork(n)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                network === n
                  ? n === "mainnet"
                    ? "bg-[#7c5cfc]/20 text-[#7c5cfc] border border-[#7c5cfc]/40"
                    : "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40"
                  : "bg-[#0f1117] text-[#64748b] border border-[#1e2535] hover:border-[#7c5cfc]/40"
              }`}
            >
              {n.charAt(0).toUpperCase() + n.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors"
            placeholder="Contract address (SP2…)"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
          <input
            className="flex-1 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors"
            placeholder="Contract name"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
          />
          <button
            onClick={handleFetchAbi}
            disabled={loadingAbi}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c5cfc] hover:bg-[#6b4ef0] disabled:opacity-50 text-white text-sm font-medium transition-colors shrink-0"
          >
            <InfoCircle size={14} color="#fff" />
            {loadingAbi ? "Loading…" : "Fetch ABI"}
          </button>
        </div>
      </div>

      {/* Function selector */}
      {abi && (
        <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] flex items-center gap-2">
            <ArrowDown2 size={13} color="#7c5cfc" /> Read-only Functions
          </h2>
          {readOnlyFns.length === 0 ? (
            <p className="text-sm text-[#64748b]">
              No read-only functions found.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {readOnlyFns.map((fn) => (
                <button
                  key={fn.name}
                  onClick={() => {
                    setSelectedFn(fn);
                    setArgValues({});
                    setResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    selectedFn?.name === fn.name
                      ? "bg-[#7c5cfc] text-white"
                      : "bg-[#0f1117] text-[#94a3b8] border border-[#1e2535] hover:border-[#7c5cfc]/50"
                  }`}
                >
                  {fn.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Arguments */}
      {selectedFn && (
        <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b]">
            Arguments
          </h2>
          {selectedFn.args.length === 0 ? (
            <p className="text-sm text-[#64748b]">No arguments required.</p>
          ) : (
            <div className="space-y-2">
              {selectedFn.args.map((arg) => (
                <div key={arg.name} className="flex items-center gap-3">
                  <div className="w-40 shrink-0">
                    <p className="text-xs text-[#e2e8f0] font-medium">
                      {arg.name}
                    </p>
                    <p className="text-[10px] text-[#64748b] font-mono">
                      {arg.type}
                    </p>
                  </div>
                  <input
                    className="flex-1 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors font-mono"
                    placeholder={arg.type}
                    value={argValues[arg.name] ?? ""}
                    onChange={(e) =>
                      setArgValues((p) => ({
                        ...p,
                        [arg.name]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <input
              className="flex-1 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors"
              placeholder="Sender address (optional)"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
            />
            <button
              onClick={handleCall}
              disabled={loadingCall}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#7c5cfc] hover:bg-[#6b4ef0] disabled:opacity-50 text-white text-sm font-medium transition-colors shrink-0"
            >
              <Send2 size={14} color="#fff" />
              {loadingCall ? "Calling…" : "Call"}
            </button>
          </div>
        </div>
      )}

      {/* Response */}
      {(result !== null || error) && (
        <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] flex items-center gap-2">
            {error ? (
              <CloseCircle size={13} color="#ef4444" />
            ) : (
              <TickCircle size={13} color="#22c55e" />
            )}
            Response
          </h2>
          <pre
            className={`text-xs font-mono rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all ${
              error
                ? "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20"
                : "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20"
            }`}
          >
            {error ?? JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Save to collection */}
      {selectedFn && collections.length > 0 && (
        <div className="bg-[#161b27] border border-[#1e2535] rounded-xl p-4 space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-[#64748b] flex items-center gap-2">
            <Save2 size={13} color="#7c5cfc" /> Save Request
          </h2>
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              className="flex-1 bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] placeholder-[#64748b] outline-none focus:border-[#7c5cfc] transition-colors"
              placeholder="Request name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <select
              className="bg-[#0f1117] border border-[#1e2535] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#7c5cfc] transition-colors"
              value={saveColId}
              onChange={(e) => setSaveColId(e.target.value)}
            >
              <option value="">Collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1e2535] hover:bg-[#7c5cfc]/30 text-[#e2e8f0] text-sm font-medium transition-colors shrink-0"
            >
              <Save2 size={14} color="#7c5cfc" />
              Save
            </button>
            {saveMsg && (
              <span className="flex items-center gap-1 text-xs text-[#22c55e]">
                <TickCircle size={12} color="#22c55e" /> {saveMsg}
              </span>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
