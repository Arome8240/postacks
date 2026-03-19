"use client";

import { useState, useEffect } from "react";
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

  // Load from saved request
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
    <div className="request-panel">
      {/* Contract inputs */}
      <section className="panel-section">
        <h2 className="section-title">Contract</h2>
        <div className="row">
          <select
            value={network}
            onChange={(e) =>
              setNetwork(e.target.value as "mainnet" | "testnet")
            }
            className="input select-sm"
          >
            <option value="mainnet">Mainnet</option>
            <option value="testnet">Testnet</option>
          </select>
        </div>
        <div className="row">
          <input
            className="input"
            placeholder="Contract address (e.g. SP2...)"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
          <input
            className="input"
            placeholder="Contract name"
            value={contractName}
            onChange={(e) => setContractName(e.target.value)}
          />
          <button
            className="btn btn-primary"
            onClick={handleFetchAbi}
            disabled={loadingAbi}
          >
            {loadingAbi ? "Loading…" : "Fetch ABI"}
          </button>
        </div>
      </section>

      {/* Function selector */}
      {abi && (
        <section className="panel-section">
          <h2 className="section-title">Read-only Function</h2>
          {readOnlyFns.length === 0 ? (
            <p className="empty-hint">No read-only functions found.</p>
          ) : (
            <div className="fn-tabs">
              {readOnlyFns.map((fn) => (
                <button
                  key={fn.name}
                  className={`fn-tab ${selectedFn?.name === fn.name ? "active" : ""}`}
                  onClick={() => {
                    setSelectedFn(fn);
                    setArgValues({});
                    setResult(null);
                  }}
                >
                  {fn.name}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Args */}
      {selectedFn && (
        <section className="panel-section">
          <h2 className="section-title">Arguments</h2>
          {selectedFn.args.length === 0 ? (
            <p className="empty-hint">No arguments.</p>
          ) : (
            <div className="args-grid">
              {selectedFn.args.map((arg) => (
                <div key={arg.name} className="arg-row">
                  <label className="arg-label">
                    {arg.name}
                    <span className="arg-type">{arg.type}</span>
                  </label>
                  <input
                    className="input"
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
          <div className="row mt-2">
            <input
              className="input"
              placeholder="Sender address (optional)"
              value={senderAddress}
              onChange={(e) => setSenderAddress(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleCall}
              disabled={loadingCall}
            >
              {loadingCall ? "Calling…" : "Call"}
            </button>
          </div>
        </section>
      )}

      {/* Result */}
      {(result !== null || error) && (
        <section className="panel-section">
          <h2 className="section-title">Response</h2>
          {error ? (
            <pre className="result-box error">{error}</pre>
          ) : (
            <pre className="result-box success">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
        </section>
      )}

      {/* Save to collection */}
      {selectedFn && collections.length > 0 && (
        <section className="panel-section">
          <h2 className="section-title">Save Request</h2>
          <form onSubmit={handleSave} className="row">
            <input
              className="input"
              placeholder="Request name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <select
              className="input select-sm"
              value={saveColId}
              onChange={(e) => setSaveColId(e.target.value)}
            >
              <option value="">Select collection…</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn btn-secondary">
              Save
            </button>
            {saveMsg && <span className="save-msg">{saveMsg}</span>}
          </form>
        </section>
      )}
    </div>
  );
}
