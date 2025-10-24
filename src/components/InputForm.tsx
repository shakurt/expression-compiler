import { useState } from "react";
import { lexAndTransform } from "@/utils/lexer";
import { parseToAst } from "@/utils/parser";

// InputForm: validates input, runs lexer and parser, returns results to parent
interface InputFormProps {
  onResult: (result: {
    tokens: any;
    transformed: string;
    ast: any;
    idMap: Record<string, string>;
  }) => void;
  onError: (error: string) => void;
}

export default function InputForm({ onResult, onError }: InputFormProps) {
  const [input, setInput] = useState("area = a + b * 50");

  function handleAnalyze() {
    try {
      // Validation phase (basic checks)
      const validationError = validateInput(input);
      if (validationError) {
        onError(validationError);
        return;
      }

      // Stage 1: Lexical analysis + transform identifiers to idN form
      const { tokens, transformed, idMap } = lexAndTransform(input);

      // Stage 2: Parse — create AST from token stream
      const ast = parseToAst(
        tokens.filter(
          (t): t is { type: string; value: string } => t !== undefined
        )
      );

      // send back
      onResult({ tokens, transformed, ast, idMap });
    } catch (e) {
      if (e instanceof Error) {
        onError(e.message);
      } else {
        onError(String(e));
      }
    }
  }

  return (
    <div>
      <label>
        Enter expression:
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          style={{ width: "100%", marginTop: 6 }}
        />
      </label>

      <div style={{ marginTop: 10 }}>
        <button onClick={handleAnalyze}>Analyze</button>
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
        Allowed: + - * / ^ parentheses `sqrt` numbers and English identifiers
        (letters then digits). Example: <code>area = a + b * 50</code>
      </div>
    </div>
  );
}

function validateInput(text) {
  if (!text || !text.trim()) return "Input is empty.";

  // parentheses balanced
  let balance = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") balance++;
    if (ch === ")") balance--;
    if (balance < 0) return "Parentheses mismatch: too many ).";
  }
  if (balance !== 0) return "Parentheses mismatch: not balanced.";

  // basic tokenization to check last token not operator
  const lastNonSpace = text.trim().slice(-1);
  if ("+-*/^=(".includes(lastNonSpace))
    return "Expression ends with an operator or invalid character.";

  // disallow non-ascii letters in identifiers and disallow identifiers starting with digit
  // We'll scan tokens quickly to find identifiers and numbers

  // <-- FIXED regex: only match tokens that start with a digit AND contain at least one letter later.
  // This avoids treating pure numbers (e.g. "50") as invalid.
  const badStartRegex = /\b\d+[A-Za-z][A-Za-z0-9]*\b/;
  if (badStartRegex.test(text))
    return "Identifiers must not start with a digit.";

  // detect non-ASCII letters (e.g. Persian) in word-like tokens
  const wordRegex = /\b[^\s()+\-*/^=]+\b/g;
  const words = text.match(wordRegex) || [];
  for (const w of words) {
    // if token is function name sqrt, or a number, or a valid identifier, it's ok
    if (/^sqrt\b/.test(w)) continue;
    if (/^[0-9]+(\.[0-9]+)?$/.test(w)) continue;
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(w)) continue;
    // otherwise it's invalid (likely non-english characters or malformed token)
    return `Invalid token or non-English identifier detected: "${w}"`;
  }

  return null;
}
