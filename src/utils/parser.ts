// src/parser.js
// Recursive-descent parser. Converts FUNC (sqrtN) into a BinaryOp '^' with right = Number("1/N").
// AST nodes:
// - Assignment { type: 'Assignment', name, id, value }
// - BinaryOp { type: 'BinaryOp', op, left, right }
// - UnaryOp { type: 'UnaryOp', op, expr }
// - Identifier { type: 'Identifier', name, id }
// - Number { type: 'Number', value }

const TOKEN_TYPES_LOCAL = {
  IDENT: "IDENT",
  NUMBER: "NUMBER",
  OP: "OP",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  ASSIGN: "ASSIGN",
  FUNC: "FUNC",
};

export function parseToAst(tokens) {
  let i = 0;
  function peek() {
    return tokens[i] || null;
  }
  function next() {
    return tokens[i++] || null;
  }

  // parse entry
  function parseProgram() {
    const first = peek();
    if (first && first.type === TOKEN_TYPES_LOCAL.IDENT) {
      // tentative assignment
      const idTok = next();
      const after = peek();
      if (after && after.type === TOKEN_TYPES_LOCAL.ASSIGN) {
        next(); // consume '='
        const expr = parseExpression();
        return {
          type: "Assignment",
          name: idTok.value,
          id: idTok.id,
          value: expr,
        };
      } else {
        // not an assignment, rewind and parse full expression
        i = 0;
      }
    }
    return parseExpression();
  }

  function parseExpression() {
    return parseAdditive();
  }

  function parseAdditive() {
    let node = parseMultiplicative();
    while (true) {
      const t = peek();
      if (
        t &&
        t.type === TOKEN_TYPES_LOCAL.OP &&
        (t.value === "+" || t.value === "-")
      ) {
        next();
        const right = parseMultiplicative();
        node = { type: "BinaryOp", op: t.value, left: node, right };
      } else break;
    }
    return node;
  }

  function parseMultiplicative() {
    let node = parsePower();
    while (true) {
      const t = peek();
      if (
        t &&
        t.type === TOKEN_TYPES_LOCAL.OP &&
        (t.value === "*" || t.value === "/")
      ) {
        next();
        const right = parsePower();
        node = { type: "BinaryOp", op: t.value, left: node, right };
      } else break;
    }
    return node;
  }

  function parsePower() {
    // right-associative: a ^ b ^ c => a ^ (b ^ c)
    let node = parseUnary();
    const t = peek();
    if (t && t.type === TOKEN_TYPES_LOCAL.OP && t.value === "^") {
      next();
      const right = parsePower();
      node = { type: "BinaryOp", op: "^", left: node, right };
    }
    return node;
  }

  function parseUnary() {
    const t = peek();
    if (
      t &&
      t.type === TOKEN_TYPES_LOCAL.OP &&
      (t.value === "+" || t.value === "-")
    ) {
      next();
      const expr = parseUnary();
      return { type: "UnaryOp", op: t.value, expr };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error("Unexpected end of input while parsing primary.");

    if (t.type === TOKEN_TYPES_LOCAL.NUMBER) {
      next();
      return { type: "Number", value: t.value };
    }

    if (t.type === TOKEN_TYPES_LOCAL.IDENT) {
      next();
      return { type: "Identifier", name: t.value, id: t.id };
    }

    if (t.type === TOKEN_TYPES_LOCAL.FUNC) {
      // FUNC LPAREN expr RPAREN -> convert to BinaryOp '^' with right Number("1/base")
      const fn = next();
      const l = peek();
      if (!l || l.type !== TOKEN_TYPES_LOCAL.LPAREN)
        throw new Error("Expected ( after function name");
      next(); // consume '('
      const expr = parseExpression();
      const r = peek();
      if (!r || r.type !== TOKEN_TYPES_LOCAL.RPAREN)
        throw new Error("Expected ) after function argument");
      next(); // consume ')'
      // create binary power node: expr ^ (1/base)
      const base = fn.base || 2;
      return {
        type: "BinaryOp",
        op: "^",
        left: expr,
        right: { type: "Number", value: `1/${base}` },
      };
    }

    if (t.type === TOKEN_TYPES_LOCAL.LPAREN) {
      next();
      const expr = parseExpression();
      const r = peek();
      if (!r || r.type !== TOKEN_TYPES_LOCAL.RPAREN)
        throw new Error("Expected )");
      next();
      return expr;
    }

    throw new Error("Unexpected token in primary: " + JSON.stringify(t));
  }

  const ast = parseProgram();
  return astToVizFormat(ast);
}

/* Convert AST to visualization tree nodes for react-d3-tree.
   Requirements:
   - Identifier nodes show "name (idN)"
   - Numbers are shown as a 'Real' node with a single child that is the literal
   - BinaryOp shows op as node name with two children
*/
function astToVizFormat(ast) {
  if (!ast) return null;

  function nodeFor(n) {
    if (!n) return { name: "null" };
    switch (n.type) {
      case "Assignment":
        return {
          name: "=",
          children: [{ name: `${n.name} (${n.id || ""})` }, nodeFor(n.value)],
        };

      case "BinaryOp":
        return { name: n.op, children: [nodeFor(n.left), nodeFor(n.right)] };

      case "UnaryOp":
        return { name: n.op, children: [nodeFor(n.expr)] };

      case "Number":
        // Real node with one child for the numeric literal (keeps tree shape consistent)
        return { name: "Real", children: [{ name: `${n.value}` }] };

      case "Identifier":
        return { name: `${n.name} (${n.id || ""})` };

      default:
        return { name: JSON.stringify(n) };
    }
  }

  return nodeFor(ast);
}
