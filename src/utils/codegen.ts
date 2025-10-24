// src/codegen.js
// Generate simple three-address code (TAC) from an AST.
// Comments in English (as requested).
//
// AST node shapes supported:
// - { type: 'Assignment', name, id?, value }
// - { type: 'BinaryOp', op, left, right }
// - { type: 'UnaryOp', op, expr }
// - { type: 'Identifier', name, id? }
// - { type: 'Number', value }   // value can be '10' or '1/2' or '0.5' etc.
//
// Output: array of instruction strings (in order).
//

import type {
  ASTNode,
  AssignmentNode,
  BinaryOpNode,
  UnaryOpNode,
  IdentifierNode,
  NumberNode,
} from "./parser";

let tempCounter = 1;

function newTemp(): string {
  return `t${tempCounter++}`;
}

function toFloatLiteral(numVal: number | string): string {
  if (typeof numVal === "number") {
    return Number.isInteger(numVal) ? `${numVal}.0` : String(numVal);
  }
  const s = String(numVal);
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    const v = a / b;
    return Number.isInteger(v) ? `${v}.0` : String(v);
  }
  if (/^-?\d+$/.test(s)) return `${s}.0`;
  return s;
}

export function generateThreeAddress(ast: ASTNode): string[] {
  tempCounter = 1;
  const instr: string[] = [];

  function gen(node: ASTNode): string {
    if (!node) throw new Error("gen: null node");
    switch (node.type) {
      case "Number": {
        return toFloatLiteral((node as NumberNode).value);
      }
      case "Identifier": {
        const n = node as IdentifierNode;
        return n.id || n.name;
      }
      case "UnaryOp": {
        const n = node as UnaryOpNode;
        const operand = gen(n.expr);
        const t = newTemp();
        instr.push(`${t} = ${n.op}${operand}`);
        return t;
      }
      case "BinaryOp": {
        const n = node as BinaryOpNode;
        const leftOp = gen(n.left);
        const rightOp = gen(n.right);
        const t = newTemp();
        instr.push(`${t} = ${leftOp} ${n.op} ${rightOp}`);
        return t;
      }
      case "Assignment": {
        const n = node as AssignmentNode;
        const r = gen(n.value);
        const target = n.id || n.name;
        instr.push(`${target} = ${r}`);
        return target;
      }
      default:
        throw new Error(
          "Unhandled node type in codegen: " + (node as any).type
        );
    }
  }

  if (ast.type === "Assignment") {
    const rhs = (ast as AssignmentNode).value;
    const result = gen(rhs);
    const target = (ast as AssignmentNode).id || (ast as AssignmentNode).name;
    instr.push(`${target} = ${result}`);
  } else {
    const res = gen(ast);
    instr.push(`_result = ${res}`);
  }

  return instr;
}
