import { useState } from "react";
import InputForm from "./components/InputForm";
import TreeView from "./components/TreeView";

const App = () => {
  // src/App.jsx

  const [tokensOutput, setTokensOutput] = useState<any[] | null>(null);
  const [transformedExpr, setTransformedExpr] = useState<string>("");
  const [astTree, setAstTree] = useState<any | null>(null);
  const [tac, setTac] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex gap-5 p-5 font-sans">
      <div className="min-w-[320px] flex-1">
        <h2 className="mb-4 text-xl font-bold">
          Mini Compiler — Stages 1 → 3 (Lex, Parse, Codegen)
        </h2>
        <InputForm
          onResult={({ tokens, transformed, ast, tac: tacOut }) => {
            setTokensOutput(tokens);
            setTransformedExpr(transformed);
            setAstTree(ast);
            setTac(tacOut);
            setError(null);
          }}
          onError={(errMsg: string) => {
            setError(errMsg);
            setTokensOutput(null);
            setTransformedExpr("");
            setAstTree(null);
            setTac(null);
          }}
        />

        {error && (
          <div className="mt-3 text-red-700">
            <strong>Validation / Error:</strong>
            <div>{error}</div>
          </div>
        )}

        {tokensOutput && (
          <div className="mt-3">
            <h3 className="font-semibold">
              Stage 1 — Lexical Analysis (tokens)
            </h3>
            <pre className="rounded bg-gray-100 p-3">
              {JSON.stringify(tokensOutput, null, 2)}
            </pre>

            <h3 className="mt-3 font-semibold">
              Transformed expression (identifier ids)
            </h3>
            <pre className="rounded bg-gray-100 p-3">{transformedExpr}</pre>

            <h3 className="mt-3 font-semibold">
              Stage 3 — Three-address code (intermediate code)
            </h3>
            <pre className="rounded bg-gray-100 p-3">
              {tac && tac.length > 0 ? tac.join("\n") : "No TAC"}
            </pre>
          </div>
        )}
      </div>

      <div className="min-w-[320px] flex-1">
        <h3 className="mb-2 font-semibold">Stage 2 — Parse Tree</h3>
        <div className="h-[70vh] rounded border border-gray-300 bg-white">
          <TreeView treeData={astTree} />
        </div>
      </div>
    </div>
  );
};

export default App;
