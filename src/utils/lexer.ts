// src/lexer.js
// Lexer: tokenizes input, annotates IDENT with id (id1, id2, ...).
// Recognizes FUNC tokens like `sqrt` or `sqrt3` (optional base digits).
// FUNC token includes: { type: 'FUNC', value: 'sqrt', base: <n>, convert: { type:'OP', value:'^' } }

const TOKEN_TYPES = {
  IDENT: "IDENT",
  NUMBER: "NUMBER",
  OP: "OP",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  ASSIGN: "ASSIGN",
  FUNC: "FUNC",
};

export function lexAndTransform(input) {
  const tokens = [];
  const idMap = new Map();
  let idCounter = 1;

  const patterns = [
    { type: "SPACE", re: /^\s+/ },
    { type: "NUMBER", re: /^\d+(?:\.\d+)?/ },
    // FUNC supports optional base digits immediately after 'sqrt', e.g. sqrt3
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
          let tok;
          switch (p.type) {
            case "NUMBER":
              tok = { type: TOKEN_TYPES.NUMBER, value: text };
              break;
            case "FUNC": {
              const baseMatch = text.match(/^sqrt(\d+)?\b/);
              const base = baseMatch && baseMatch[1] ? Number(baseMatch[1]) : 2;
              tok = {
                type: TOKEN_TYPES.FUNC,
                value: "sqrt",
                base,
                convert: { type: "OP", value: "^" },
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
          tokens.push(tok);
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
    if (t.type === TOKEN_TYPES.IDENT) {
      if (!idMap.has(t.value)) idMap.set(t.value, `id${idCounter++}`);
      t.id = idMap.get(t.value);
    }
  }

  // Build transformed expression (identifier ids) and convert FUNC(...) -> ( inner ) ^ 1/base
  // We walk tokens and when we find FUNC followed by LPAREN we find its matching RPAREN,
  // recursively build the inner expression (substituting ids for identifiers) and then insert: ( inner ) ^ 1/base
  function buildTransformed(startIndex = 0, endIndex = tokens.length) {
    const parts = [];
    let i = startIndex;
    while (i < endIndex) {
      const tk = tokens[i];
      if (!tk) break;

      if (tk.type === TOKEN_TYPES.FUNC) {
        // expect LPAREN at i+1
        const nextTk = tokens[i + 1];
        if (!nextTk || nextTk.type !== TOKEN_TYPES.LPAREN) {
          throw new Error(
            "Expected ( after function token in transformed pass"
          );
        }
        // find matching RPAREN
        let depth = 0;
        let j = i + 1;
        for (; j < endIndex; j++) {
          if (tokens[j].type === TOKEN_TYPES.LPAREN) depth++;
          else if (tokens[j].type === TOKEN_TYPES.RPAREN) {
            depth--;
            if (depth === 0) break;
          }
        }
        if (j >= endIndex)
          throw new Error("Unmatched parenthesis after function");

        // inner content is between i+2 .. j-1
        const innerParts = buildTransformed(i + 2, j);
        // produce "( inner ) ^ 1/base"
        parts.push("(" + innerParts.join(" ") + ")");
        parts.push(tk.convert.value); // '^'
        // we represent exponent as fraction notation "1/N" (keeps it simple and readable)
        parts.push(`1/${tk.base}`);
        i = j + 1;
        continue;
      }

      if (tk.type === TOKEN_TYPES.IDENT) parts.push(tk.id);
      else parts.push(tk.value);

      i++;
    }
    return parts;
  }

  const transformedParts = buildTransformed(0, tokens.length);
  const transformed = transformedParts.join(" ");
  return { tokens, transformed, idMap: Object.fromEntries(idMap) };
}
