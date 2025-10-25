export const TOKEN_TYPES = {
  IDENT: "IDENT", // like A or any other variables
  NUMBER: "NUMBER", // like 123 or 45.67
  OP: "OP", // like +, -, *, /, ^
  LPAREN: "LPAREN", // (
  RPAREN: "RPAREN", // )
  ASSIGN: "ASSIGN", // =
  FUNC: "FUNC", // sqrt
} as const;

export interface Token {
  type: string;
  value?: string;
  id?: string;
  base?: number;
  convert?: { type: string; value: string };
}

// Simplified AST (abstract syntax tree) node type
export interface ASTNode {
  type: string;
  name?: string;
  id?: string;
  value?: ASTNode | string;
  op?: string;
  left?: ASTNode;
  right?: ASTNode;
  expr?: ASTNode;
}
