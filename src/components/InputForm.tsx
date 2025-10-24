// src/components/InputForm.jsx
import React, { useState } from "react";
import { lexAndTransform } from "@/utils/lexer";
import { parseTokens, astToVizFormat } from "@/utils/parser";
import { generateThreeAddress } from "@/utils/codegen";

// InputForm: validates input, runs lexer and parser, returns results to parent
export default function InputForm({ onResult, onError }) {
  const [input, setInput] = useState("A = sqrt(B - ( C - D ) ^ E ) - 10");

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

      // Stage 2: Parse — create internal AST from token stream
      // parseTokens returns the internal AST
      const ast = parseTokens(tokens);

      // build viz tree for display
      const viz = astToVizFormat(ast);

      // Stage 3: Code generation (three-address code) from the AST
      const tac = generateThreeAddress(ast); // returns array of strings

      // send back results
      onResult({ tokens, transformed, ast: viz, tac, idMap });
    } catch (e) {
      if (e instanceof Error) onError(e.message);
      else onError(String(e));
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
        (letters then digits). Example:
        <code> A = sqrt(B - (C - D) ^ E) - 10 </code>
      </div>
    </div>
  );
}

// Basic input validation (same as before)
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

  // last token not operator
  const lastNonSpace = text.trim().slice(-1);
  if ("+-*/^=(".includes(lastNonSpace))
    return "Expression ends with an operator or invalid character.";

  // avoid identifiers starting with digit (but allow pure numbers)
  const badStartRegex = /\b\d+[A-Za-z][A-Za-z0-9]*\b/;
  if (badStartRegex.test(text))
    return "Identifiers must not start with a digit.";

  const wordRegex = /\b[^\s()+\-*/^=]+\b/g;
  const words = text.match(wordRegex) || [];
  for (const w of words) {
    if (/^sqrt\d*\b/.test(w)) continue;
    if (/^[0-9]+(\.[0-9]+)?$/.test(w)) continue;
    if (/^[A-Za-z][A-Za-z0-9]*$/.test(w)) continue;
    return `Invalid token or non-English identifier detected: "${w}"`;
  }

  return null;
}
