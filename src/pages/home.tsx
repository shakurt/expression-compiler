import { useState } from "react";
import InputForm from "@/components/InputForm";
import TreeView from "@/components/TreeView";

const HomePage = () => {
  const [tokensOutput, setTokensOutput] = useState<any[] | null>(null);
  const [transformedExpr, setTransformedExpr] = useState<string>("");
  const [astTree, setAstTree] = useState<any | null>(null);
  const [tac, setTac] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTokensCollapsed, setIsTokensCollapsed] = useState<boolean>(false);

  return (
    <section className="container font-sans">
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
        <div className="mt-3 text-red-500">
          <strong>Validation / Error:</strong>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {tokensOutput && (
        <>
          <hr className="mt-3" />
          <section className="my-3">
            <div className="mb-1 flex items-center gap-3">
              <h3 className="font-semibold">
                Stage 1 — Lexical Analysis (tokens)
              </h3>
              <button
                onClick={() => setIsTokensCollapsed(!isTokensCollapsed)}
                type="button"
                className="text-primary cursor-pointer text-sm font-semibold hover:underline"
              >
                {isTokensCollapsed ? "Show" : "Hide"}
              </button>
            </div>
            {!isTokensCollapsed && (
              <pre className="rounded bg-gray-700 p-3 text-white">
                {JSON.stringify(tokensOutput, null, 2)}
              </pre>
            )}
          </section>

          <section className="my-3 flex flex-col md:justify-between md:gap-10 lg:flex-row">
            <div>
              {astTree && (
                <div className="lg:hidden">
                  <TreeView treeData={astTree} />
                </div>
              )}
              <h3 className="mt-3 mb-1 font-semibold lg:mt-0">
                Transformed expression (identifier ids)
              </h3>
              <pre className="rounded bg-gray-700 p-3 text-white">
                {transformedExpr}
              </pre>
              <h3 className="mt-3 mb-1 font-semibold">
                Stage 3 — Three-address code (intermediate code)
              </h3>
              <pre className="rounded bg-gray-700 p-3 text-white">
                {tac && tac.length > 0 ? tac.join("\n") : "No TAC"}
              </pre>
            </div>
            {astTree && (
              <div className="hidden flex-1 lg:block">
                <TreeView treeData={astTree} />
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
};

export default HomePage;
