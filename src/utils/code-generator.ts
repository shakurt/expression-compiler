// Code Generator: converts AST into three-address code (TAC)
// TAC is a simple intermediate representation where each instruction has at most one operator

import type { ASTNode } from "@/types";

let tempCounter = 1;

// Generate a new temporary variable name (t1, t2, t3, ...)
const newTemp = (): string => `t${tempCounter++}`;

// Convert a number to float literal format (e.g., "10" -> "10.0", "1/2" -> "0.5")
const toFloatLiteral = (value: number | string): string => {
  // Already a number
  if (typeof value === "number") {
    return Number.isInteger(value) ? `${value}.0` : String(value);
  }

  const str = String(value);

  // Handle string fractions
  if (str.includes("/")) {
    const [numerator, denominator] = str.split("/").map(Number);
    const result = numerator / denominator;
    return Number.isInteger(result) ? `${result}.0` : String(result);
  }

  // Handle integer strings
  if (/^-?\d+$/.test(str)) {
    return `${str}.0`;
  }

  // Already a decimal like "10.5"
  return str;
};

// Generate three-address code from AST
export function generateThreeAddress(ast: ASTNode): string[] {
  console.log(ast);

  tempCounter = 1; // Reset temp counter
  const instructions: string[] = [];

  // Generate code for a node and return the operand (variable or literal)
  const generate = (node: ASTNode): string => {
    if (!node) throw new Error("Cannot generate code for null node");

    switch (node.type) {
      // Number: convert to float literal
      case "Number": {
        return toFloatLiteral(node.value as string);
      }

      // Identifier: use id if available, otherwise use name
      case "Identifier": {
        return node.id || node.name || "";
      }

      // Unary operation: +x or -x
      case "UnaryOp": {
        const operand = generate(node.expr!);
        const temp = newTemp();
        instructions.push(`${temp} = ${node.op}${operand}`);
        return temp;
      }

      // Binary operation: x + y, x * y, etc.
      case "BinaryOp": {
        const left = generate(node.left!);
        const right = generate(node.right!);
        const temp = newTemp();
        instructions.push(`${temp} = ${left} ${node.op} ${right}`);
        return temp;
      }

      // Assignment: x = expr
      case "Assignment": {
        const result = generate(node.value as ASTNode);
        const target = node.id || node.name || "";
        instructions.push(`${target} = ${result}`);
        return target;
      }

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  };

  // Handle top-level node
  if (ast.type === "Assignment") {
    // For assignments, generate the right side and assign to variable
    const rightSide = generate(ast.value as ASTNode);
    const variable = ast.id || ast.name || "";
    instructions.push(`${variable} = ${rightSide}`);
  } else {
    // For expressions, store result in _result
    const result = generate(ast);
    instructions.push(`_result = ${result}`);
  }

  return instructions;
}
