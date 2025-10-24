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

let tempCounter = 1;

function newTemp() {
  return `t${tempCounter++}`;
}

function toFloatLiteral(numVal) {
  // numVal may be a number (e.g. 10) or a string '10' or '1/2' or '0.5'
  if (typeof numVal === "number") {
    // ensure .0 if integer
    return Number.isInteger(numVal) ? `${numVal}.0` : String(numVal);
  }
  const s = String(numVal);
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    const v = a / b;
    // keep a reasonable decimal representation
    return Number.isInteger(v) ? `${v}.0` : String(v);
  }
  // if it's integer string -> convert to float with .0
  if (/^-?\d+$/.test(s)) return `${s}.0`;
  // otherwise return as-is (e.g. '0.5')
  return s;
}

export function generateThreeAddress(ast) {
  tempCounter = 1;
  const instr = [];

  // gen returns an operand string (idN, temp, or float literal)
  function gen(node) {
    if (!node) throw new Error("gen: null node");

    switch (node.type) {
      case "Number": {
        // convert to proper float literal
        return toFloatLiteral(node.value);
      }

      case "Identifier": {
        // prefer id if present (e.g. id3), else name
        return node.id || node.name;
      }

      case "UnaryOp": {
        // handle unary + and -
        const operand = gen(node.expr);
        const t = newTemp();
        instr.push(`${t} = ${node.op}${operand}`);
        return t;
      }

      case "BinaryOp": {
        // Generate left and right operands first
        const leftOp = gen(node.left);
        const rightOp = gen(node.right);

        // If rightOp is a fraction-like Number node represented e.g. as "1/2"
        // the gen for Number already converted to float literal string.
        const t = newTemp();
        instr.push(`${t} = ${leftOp} ${node.op} ${rightOp}`);
        return t;
      }

      case "Assignment": {
        // unlikely to be called directly here for nested nodes; handled outside
        const r = gen(node.value);
        const target = node.id || node.name;
        instr.push(`${target} = ${r}`);
        return target;
      }

      default:
        throw new Error("Unhandled node type in codegen: " + node.type);
    }
  }

  // top-level: if assignment, generate and then assign
  if (ast.type === "Assignment") {
    const rhs = ast.value;
    // generate RHS to temporaries
    const result = gen(rhs);
    // ensure final assignment: convert target to id if present
    const target = ast.id || ast.name;
    instr.push(`${target} = ${result}`);
  } else {
    // expression only
    const res = gen(ast);
    instr.push(`_result = ${res}`);
  }

  return instr;
}
