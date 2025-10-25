import { useState } from "react";
import type React from "react";
import { lexAndTransform } from "@/utils/lexer";
import { parseTokens, astToVizFormat } from "@/utils/parser";
import { generateThreeAddress } from "@/utils/code-generator";

interface InputFormProps {
  onResult: (result: {
    tokens: any[];
    transformed: string;
    ast: any;
    tac: string[];
  }) => void;
  onError: (msg: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ onResult, onError }) => {
  const [input, setInput] = useState<string>(
    "A = sqrt(B - ( C - D ) ^ E ) - 10"
  );

  const handleAnalyze = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Validation phase (BASIC CHECKS)
      const validationError = validateInput(input);
      if (validationError) {
        onError(validationError);
        return;
      }

      // Stage 1: Lexical analysis + transform identifiers to id form
      const { tokens, transformed } = lexAndTransform(input);

      // Stage 2: Parse — create internal AST from token stream
      const ast = parseTokens(tokens);

      // build viz tree for display
      const tree = astToVizFormat(ast);

      // Stage 3: Code generation (three-address code) from the AST
      const tac = generateThreeAddress(ast); // returns array of strings

      // send back results
      onResult({ tokens, transformed, ast: tree, tac });
    } catch (e) {
      if (e instanceof Error) onError(e.message);
      else onError(String(e));
    }
  };

  return (
    <form className="mx-auto mt-5 max-w-2xl" onSubmit={handleAnalyze}>
      <label htmlFor="expression" className="mb-1 block font-medium">
        Enter Expression:
      </label>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={input}
          autoComplete="expression"
          name="expression"
          id="expression"
          onChange={(e) => setInput(e.target.value)}
          className="focus:border-primary focus:ring-primary w-full rounded border border-gray-300 p-2 transition-all ease-in-out outline-none focus:ring-1 focus:outline-none"
        />
        <button
          type="submit"
          className="bg-primary hover:bg-primary/80 cursor-pointer rounded px-4 py-2 text-white transition-colors"
        >
          Analyze
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Allowed: + - * / ^ parentheses <code>sqrt</code> numbers and English
        identifiers (letters then digits).
        <br /> Example:
        <code className="ml-1">A = sqrt(B - (C - D) ^ E) - 10</code>
      </p>
    </form>
  );
};

function validateInput(text: string): string | null {
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

  // last or first token not operator
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

export default InputForm;
