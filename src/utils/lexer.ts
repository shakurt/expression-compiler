// src/lexer.js
// Lexer: tokenizes input, annotates IDENT with id (id1, id2, ...).
// Recognizes FUNC tokens like `sqrt` or `sqrt3` (optional base digits).
// FUNC token includes: { type: 'FUNC', value: 'sqrt', base: <n>, convert: { type:'OP', value:'^' } }

export const TOKEN_TYPES = {
  IDENT: "IDENT",
  NUMBER: "NUMBER",
  OP: "OP",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  ASSIGN: "ASSIGN",
  FUNC: "FUNC",
} as const;

type TokenType = (typeof TOKEN_TYPES)[keyof typeof TOKEN_TYPES];

interface BaseToken {
  type: TokenType;
  value?: string;
}

interface NumberToken extends BaseToken {
  type: typeof TOKEN_TYPES.NUMBER;
  value: string;
}

interface IdentToken extends BaseToken {
  type: typeof TOKEN_TYPES.IDENT;
  value: string;
  id?: string;
}

interface FuncToken extends BaseToken {
  type: typeof TOKEN_TYPES.FUNC;
  value: "sqrt";
  base: number;
  convert: { type: typeof TOKEN_TYPES.OP; value: string };
}

interface OpToken extends BaseToken {
  type: typeof TOKEN_TYPES.OP;
  value: string;
}

interface ParenToken extends BaseToken {
  type: typeof TOKEN_TYPES.LPAREN | typeof TOKEN_TYPES.RPAREN;
  value: string;
}

interface AssignToken extends BaseToken {
  type: typeof TOKEN_TYPES.ASSIGN;
  value: string;
}

export type Token =
  | NumberToken
  | IdentToken
  | FuncToken
  | OpToken
  | ParenToken
  | AssignToken;

type Pattern = { type: string; re: RegExp };

export function lexAndTransform(input: string): {
  tokens: Token[];
  transformed: string;
  idMap: Record<string, string>;
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
              tok = { type: TOKEN_TYPES.NUMBER, value: text } as NumberToken;
              break;
            case "FUNC": {
              const baseMatch = text.match(/^sqrt(\d+)?\b/);
              const base = baseMatch && baseMatch[1] ? Number(baseMatch[1]) : 2;
              tok = {
                type: TOKEN_TYPES.FUNC,
                value: "sqrt",
                base,
                convert: { type: TOKEN_TYPES.OP, value: "^" },
              } as FuncToken;
              break;
            }
            case "IDENT":
              tok = { type: TOKEN_TYPES.IDENT, value: text } as IdentToken;
              break;
            case "OP":
              tok = { type: TOKEN_TYPES.OP, value: text } as OpToken;
              break;
            case "LPAREN":
              tok = { type: TOKEN_TYPES.LPAREN, value: text } as ParenToken;
              break;
            case "RPAREN":
              tok = { type: TOKEN_TYPES.RPAREN, value: text } as ParenToken;
              break;
            case "ASSIGN":
              tok = { type: TOKEN_TYPES.ASSIGN, value: text } as AssignToken;
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
      const ident = t as IdentToken;
      if (!idMap.has(ident.value)) idMap.set(ident.value, `id${idCounter++}`);
      ident.id = idMap.get(ident.value)!;
    }
  }

  function buildTransformed(
    startIndex = 0,
    endIndex = tokens.length
  ): string[] {
    const parts: string[] = [];
    let i = startIndex;
    while (i < endIndex) {
      const tk = tokens[i];
      if (!tk) break;

      if (tk.type === TOKEN_TYPES.FUNC) {
        const nextTk = tokens[i + 1];
        if (!nextTk || nextTk.type !== TOKEN_TYPES.LPAREN) {
          throw new Error(
            "Expected ( after function token in transformed pass"
          );
        }
        let depth = 0;
        let j = i + 1;
        for (; j < endIndex; j++) {
          const tt = tokens[j];
          if (!tt) continue;
          if (tt.type === TOKEN_TYPES.LPAREN) depth++;
          else if (tt.type === TOKEN_TYPES.RPAREN) {
            depth--;
            if (depth === 0) break;
          }
        }
        if (j >= endIndex)
          throw new Error("Unmatched parenthesis after function");
        const innerParts = buildTransformed(i + 2, j);
        parts.push("(" + innerParts.join(" ") + ")");
        const funcTk = tk as FuncToken;
        parts.push(funcTk.convert.value);
        parts.push(`1/${funcTk.base}`);
        i = j + 1;
        continue;
      }
      if (tk.type === TOKEN_TYPES.IDENT) parts.push((tk as IdentToken).id!);
      else parts.push(tk.value ?? "");
      i++;
    }
    return parts;
  }

  const transformedParts = buildTransformed(0, tokens.length);
  const transformed = transformedParts.join(" ");
  return {
    tokens,
    transformed,
    idMap: Object.fromEntries(idMap) as Record<string, string>,
  };
}
