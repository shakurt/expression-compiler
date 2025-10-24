import React, { useState } from "react";
import InputForm from "./components/InputForm";
import TreeView from "./components/TreeView";

// Simple layout: left side input+results, right side tree view
export default function App() {
  const [tokensOutput, setTokensOutput] = useState(null);
  const [transformedExpr, setTransformedExpr] = useState("");
  const [astTree, setAstTree] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        gap: 20,
        padding: 20,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ flex: 1, minWidth: 320 }}>
        <h2>Mini Compiler — Stages 1 & 2</h2>
        <InputForm
          onResult={({ tokens, transformed, ast }) => {
            setTokensOutput(tokens);
            setTransformedExpr(transformed);
            setAstTree(ast);
            setError(null);
          }}
          onError={(errMsg) => {
            setError(errMsg);
            setTokensOutput(null);
            setTransformedExpr("");
            setAstTree(null);
          }}
        />

        {error && (
          <div style={{ marginTop: 12, color: "darkred" }}>
            <strong>Validation / Error:</strong>
            <div>{error}</div>
          </div>
        )}

        {tokensOutput && (
          <div style={{ marginTop: 12 }}>
            <h3>Stage 1 — Lexical Analysis (tokens)</h3>
            <pre style={{ background: "#f5f5f5", padding: 12 }}>
              {JSON.stringify(tokensOutput, null, 2)}
            </pre>

            <h3>Transformed expression (identifier ids)</h3>
            <pre style={{ background: "#f5f5f5", padding: 12 }}>
              {transformedExpr}
            </pre>
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 320 }}>
        <h3>Stage 2 — Parse Tree</h3>
        <div style={{ height: "70vh", border: "1px solid #ddd" }}>
          <TreeView treeData={astTree} />
        </div>
      </div>
    </div>
  );
}
