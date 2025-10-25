import type { Token, ASTNode } from "@/types";
import { TOKEN_TYPES } from "@/types";

// Parse tokens into AST
function parseTokens(tokens: Token[]): ASTNode {
  let currentIndex = 0;

  // Get current token without moving forward
  const peek = (): Token | null => tokens[currentIndex] || null;

  // Get current token and move to next
  const consume = (): Token | null => tokens[currentIndex++] || null;

  // Check if token matches a type
  const isType = (token: Token | null, type: string): boolean =>
    token?.type === type;

  // Check if token is an operator with specific value
  const isOperator = (token: Token | null, ...ops: string[]): boolean =>
    isType(token, TOKEN_TYPES.OP) && ops.includes(token?.value || "");

  // Main entry: check for assignment or expression
  // We just want to modify currentIndex to point to the first token of expression
  const parseProgram = (): ASTNode => {
    const first = peek();
    if (isType(first, TOKEN_TYPES.IDENT)) {
      const identToken = consume()!;
      const next = peek();

      if (isType(next, TOKEN_TYPES.ASSIGN)) {
        consume(); // consume '='
        const rightSide = parseExpression();
        return {
          type: "Assignment",
          name: identToken.value!,
          id: identToken.id,
          value: rightSide,
        };
      }
      // Not an assignment, reset
      currentIndex = 0;
    }
    return parseExpression();
  };

  const parseExpression = (): ASTNode => {
    return parseAdditive();
  };

  // Handle + and - operators
  const parseAdditive = (): ASTNode => {
    let left = parseMultiplicative();

    while (isOperator(peek(), "+", "-")) {
      const operator = consume()!;
      const right = parseMultiplicative();
      left = { type: "BinaryOp", op: operator.value!, left, right };
    }

    return left;
  };

  // Handle * and / operators
  const parseMultiplicative = (): ASTNode => {
    let left = parsePower();

    while (isOperator(peek(), "*", "/")) {
      const operator = consume()!;
      const right = parsePower();
      left = { type: "BinaryOp", op: operator.value!, left, right };
    }

    return left;
  };

  // Handle ^ operator (right-associative)
  const parsePower = (): ASTNode => {
    const left = parseUnary();

    if (isOperator(peek(), "^")) {
      consume();
      const right = parsePower(); // Right-associative recursion
      return { type: "BinaryOp", op: "^", left, right };
    }

    return left;
  };

  // Handle unary + and - operators
  const parseUnary = (): ASTNode => {
    if (isOperator(peek(), "+", "-")) {
      const operator = consume()!;
      const expression = parseUnary();
      return { type: "UnaryOp", op: operator.value!, expr: expression };
    }

    return parsePrimary();
  };

  // Handle numbers, identifiers, functions, and parentheses
  const parsePrimary = (): ASTNode => {
    const token = peek();

    if (!token) {
      throw new Error("Unexpected end of input");
    }

    // Number
    if (isType(token, TOKEN_TYPES.NUMBER)) {
      consume();
      return { type: "Number", value: token.value! };
    }

    // Identifier
    if (isType(token, TOKEN_TYPES.IDENT)) {
      consume();
      return { type: "Identifier", name: token.value!, id: token.id };
    }

    // Function: sqrt(expr) becomes expr ^ (1/base)
    if (isType(token, TOKEN_TYPES.FUNC)) {
      const funcToken = consume()!;

      if (!isType(peek(), TOKEN_TYPES.LPAREN)) {
        throw new Error("Expected ( after function");
      }
      consume(); // consume '('

      const innerExpression = parseExpression();

      if (!isType(peek(), TOKEN_TYPES.RPAREN)) {
        throw new Error("Expected ) after function argument");
      }
      consume(); // consume ')'

      const base = funcToken.base || 2;
      return {
        type: "BinaryOp",
        op: "^",
        left: innerExpression,
        right: { type: "Number", value: `1/${base}` },
      };
    }

    // Parentheses
    if (isType(token, TOKEN_TYPES.LPAREN)) {
      consume();
      const expression = parseExpression();

      if (!isType(peek(), TOKEN_TYPES.RPAREN)) {
        throw new Error("Expected closing )");
      }
      consume();

      return expression;
    }

    throw new Error(`Unexpected token: ${JSON.stringify(token)}`);
  };

  return parseProgram();
}

// Convert AST to react-d3-tree format
function astToVizFormat(ast: ASTNode | null): any {
  if (!ast) return null;

  function convertNode(node: ASTNode | null | undefined): any {
    if (!node) return { name: "null" };

    switch (node.type) {
      case "Assignment":
        return {
          name: "=",
          children: [
            { name: `${node.name} (${node.id || ""})` },
            convertNode(node.value as ASTNode),
          ],
        };

      case "BinaryOp":
        return {
          name: node.op,
          children: [convertNode(node.left), convertNode(node.right)],
        };

      case "UnaryOp":
        return {
          name: node.op,
          children: [convertNode(node.expr)],
        };

      case "Number":
        return {
          name: "Real",
          children: [{ name: `${node.value}` }],
        };

      case "Identifier":
        return { name: `${node.name} (${node.id || ""})` };

      default:
        return { name: JSON.stringify(node) };
    }
  }

  return convertNode(ast);
}

export { parseTokens, astToVizFormat };
