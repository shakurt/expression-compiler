// src/parser.js
// Exports:
// - parseTokens(tokens): returns internal AST (Assignment, BinaryOp, UnaryOp, Identifier, Number)
// - astToVizFormat(ast): converts AST -> tree format for react-d3-tree

// TypeScript types for tokens and AST nodes
import type { Token } from "./lexer";

const TOKEN_TYPES_LOCAL = {
  IDENT: "IDENT",
  NUMBER: "NUMBER",
  OP: "OP",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  ASSIGN: "ASSIGN",
  FUNC: "FUNC",
} as const;

// AST node types
export type ASTNode =
  | AssignmentNode
  | BinaryOpNode
  | UnaryOpNode
  | IdentifierNode
  | NumberNode;

export interface AssignmentNode {
  type: "Assignment";
  name: string;
  id?: string;
  value: ASTNode;
}
export interface BinaryOpNode {
  type: "BinaryOp";
  op: string;
  left: ASTNode;
  right: ASTNode;
}
export interface UnaryOpNode {
  type: "UnaryOp";
  op: string;
  expr: ASTNode;
}
export interface IdentifierNode {
  type: "Identifier";
  name: string;
  id?: string;
}
export interface NumberNode {
  type: "Number";
  value: string;
}

// Parse tokens into AST
export function parseTokens(tokens: Token[]): ASTNode {
  let i = 0;
  function peek(): Token | null {
    return tokens[i] || null;
  }
  function next(): Token | null {
    return tokens[i++] || null;
  }

  function parseProgram(): ASTNode {
    const first = peek();
    if (first && first.type === TOKEN_TYPES_LOCAL.IDENT) {
      const idTok = next()!;
      const after = peek();
      if (after && after.type === TOKEN_TYPES_LOCAL.ASSIGN) {
        next(); // consume '='
        const expr = parseExpression();
        return {
          type: "Assignment",
          name: idTok.value!,
          id: (idTok as any).id,
          value: expr,
        };
      } else {
        i = 0;
      }
    }
    return parseExpression();
  }

  function parseExpression(): ASTNode {
    return parseAdditive();
  }

  function parseAdditive(): ASTNode {
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
        node = { type: "BinaryOp", op: t.value!, left: node, right };
      } else break;
    }
    return node;
  }

  function parseMultiplicative(): ASTNode {
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
        node = { type: "BinaryOp", op: t.value!, left: node, right };
      } else break;
    }
    return node;
  }

  function parsePower(): ASTNode {
    let node = parseUnary();
    const t = peek();
    if (t && t.type === TOKEN_TYPES_LOCAL.OP && t.value === "^") {
      next();
      const right = parsePower();
      node = { type: "BinaryOp", op: "^", left: node, right };
    }
    return node;
  }

  function parseUnary(): ASTNode {
    const t = peek();
    if (
      t &&
      t.type === TOKEN_TYPES_LOCAL.OP &&
      (t.value === "+" || t.value === "-")
    ) {
      next();
      const expr = parseUnary();
      return { type: "UnaryOp", op: t.value!, expr };
    }
    return parsePrimary();
  }

  function parsePrimary(): ASTNode {
    const t = peek();
    if (!t) throw new Error("Unexpected end of input while parsing primary.");

    if (t.type === TOKEN_TYPES_LOCAL.NUMBER) {
      next();
      return { type: "Number", value: t.value! };
    }

    if (t.type === TOKEN_TYPES_LOCAL.IDENT) {
      next();
      return { type: "Identifier", name: t.value!, id: (t as any).id };
    }

    if (t.type === TOKEN_TYPES_LOCAL.FUNC) {
      const fn = next()!;
      const l = peek();
      if (!l || l.type !== TOKEN_TYPES_LOCAL.LPAREN)
        throw new Error("Expected ( after function name");
      next();
      const expr = parseExpression();
      const r = peek();
      if (!r || r.type !== TOKEN_TYPES_LOCAL.RPAREN)
        throw new Error("Expected ) after function argument");
      next();
      const base = (fn as any).base || 2;
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
  return ast;
}

// Convert AST to react-d3-tree format
export function astToVizFormat(ast: ASTNode | null): any {
  if (!ast) return null;

  function nodeFor(n: ASTNode | null): any {
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
        return { name: "Real", children: [{ name: `${n.value}` }] };
      case "Identifier":
        return { name: `${n.name} (${n.id || ""})` };
      default:
        return { name: JSON.stringify(n) };
    }
  }

  return nodeFor(ast);
}
