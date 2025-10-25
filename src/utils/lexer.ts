import type { Token } from "@/types";
import { TOKEN_TYPES } from "@/types";

type Pattern = { type: string; re: RegExp };

function lexAndTransform(input: string): {
  tokens: Token[];
  transformed: string;
  // idMap: Record<string, string>;
} {
  const tokens: Token[] = [];
  const idMap = new Map<string, string>();
  let idCounter = 1;

  const patterns: Pattern[] = [
    { type: "SPACE", re: /^\s+/ },
    { type: "NUMBER", re: /^\d+(?:\.\d+)?/ },
    { type: "FUNC", re: /^sqrt(\d+)?\b/ },
    { type: "IDENT", re: /^[A-Za-z][A-Za-z0-9]*/ },
    { type: "OP", re: /^[+\-*/^]/ },
    { type: "LPAREN", re: /^\(/ },
    { type: "RPAREN", re: /^\)/ },
    { type: "ASSIGN", re: /^=/ },
  ];

  let s = input;
  // try to match each pattern and get the tokens from text
  while (s.length > 0) {
    let matched = false;
    for (const p of patterns) {
      const m = s.match(p.re);

      if (m) {
        matched = true;
        const text = m[0];
        if (p.type !== "SPACE") {
          let tok: Token | undefined;
          switch (p.type) {
            case "NUMBER":
              tok = { type: TOKEN_TYPES.NUMBER, value: text };
              break;
            case "FUNC": {
              const baseMatch = text.match(/^sqrt(\d+)?\b/);
              const base =
                baseMatch && baseMatch[1] !== undefined
                  ? Number(baseMatch[1])
                  : 2;
              tok = {
                type: TOKEN_TYPES.FUNC,
                value: "sqrt",
                base,
                convert: { type: TOKEN_TYPES.OP, value: "^" },
              };
              break;
            }
            case "IDENT":
              tok = { type: TOKEN_TYPES.IDENT, value: text };
              break;
            case "OP":
              tok = { type: TOKEN_TYPES.OP, value: text };
              break;
            case "LPAREN":
              tok = { type: TOKEN_TYPES.LPAREN, value: text };
              break;
            case "RPAREN":
              tok = { type: TOKEN_TYPES.RPAREN, value: text };
              break;
            case "ASSIGN":
              tok = { type: TOKEN_TYPES.ASSIGN, value: text };
              break;
          }
          if (tok) tokens.push(tok);
        }
        s = s.slice(text.length);
        break;
      }
    }
    if (!matched) {
      throw new Error("Unknown token starting at: " + s);
    }
  }

  // assign ids to identifier tokens and annotate tokens with their id
  for (const t of tokens) {
    if (t && t.type === TOKEN_TYPES.IDENT) {
      if (!idMap.has(t.value!)) idMap.set(t.value!, `id${idCounter++}`);
      t.id = idMap.get(t.value!)!;
    }
  }

  // Find matching closing parenthesis of sqrt
  const findMatchingParen = (start: number, end: number): number => {
    let depth = 0;
    for (let j = start; j < end; j++) {
      const token = tokens[j];
      if (!token) continue;

      if (token.type === TOKEN_TYPES.LPAREN) depth++;
      else if (token.type === TOKEN_TYPES.RPAREN) {
        depth--;
        if (depth === 0) return j;
      }
    }
    throw new Error("Unmatched parenthesis after function");
  };

  // Transform tokens to string representation(sqrt => ^ 1/base)
  const buildTransformed = (
    startIndex = 0,
    endIndex = tokens.length
  ): string[] => {
    const parts: string[] = [];
    let i = startIndex;

    while (i < endIndex) {
      const token = tokens[i];
      if (!token) break;

      // Handle function: sqrt(expr) becomes (expr) ^ 1/base
      if (token.type === TOKEN_TYPES.FUNC) {
        const nextToken = tokens[i + 1];

        if (!nextToken || nextToken.type !== TOKEN_TYPES.LPAREN) {
          throw new Error("Expected ( after function token");
        }

        const closingParenIndex = findMatchingParen(i + 1, endIndex);

        const innerExpression = buildTransformed(i + 2, closingParenIndex);

        parts.push("(" + innerExpression.join(" ") + ")");
        parts.push(token.convert!.value); // ^
        parts.push(`1/${token.base}`);

        i = closingParenIndex + 1;
        continue;
      }

      // Handle identifier: use its id
      if (token.type === TOKEN_TYPES.IDENT) {
        parts.push(token.id!);
      } else {
        parts.push(token.value ?? "");
      }

      i++;
    }

    return parts;
  };

  const transformedParts = buildTransformed(0, tokens.length);
  const transformed = transformedParts.join(" ");

  return {
    tokens,
    transformed,
    // idMap: Object.fromEntries(idMap) as Record<string, string>,
  };
}

export { lexAndTransform };
