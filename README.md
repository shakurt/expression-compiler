
# Expression Compiler (React + TypeScript)

This project is a simple expression compiler built for a university compiler course. It demonstrates the main stages of compilation for mathematical expressions:

- **Lexical Analysis**: Tokenizes the input string (identifiers, numbers, operators, parentheses, functions).
- **Parsing**: Builds an Abstract Syntax Tree (AST) from the token stream.
- **AST Visualization**: Shows the parse tree using a graphical tree view.
- **Code Generation**: Produces three-address code (TAC) from the AST.

## Features

- Input and validate math expressions (supports variables, numbers, +, -, *, /, ^, parentheses, and `sqrt` function).
- See the token list, transformed expression, parse tree, and generated TAC.
- All logic is implemented in TypeScript and React.
- Visualizes the parse tree using `react-d3-tree`.
- Styled with Tailwind CSS.

## Main Packages Used

- [React](https://react.dev/) — UI framework
- [Vite](https://vitejs.dev/) — build tool and dev server
- [Tailwind CSS](https://tailwindcss.com/) — utility-first CSS framework
- [react-d3-tree](https://github.com/bkrem/react-d3-tree) — parse tree visualization

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

- `src/utils/lexer.ts` — Lexer (tokenizer)
- `src/utils/parser.ts` — Parser and AST builder
- `src/utils/codegen.ts` — Three-address code generator
- `src/components/InputForm.tsx` — Main input and analysis UI
- `src/components/TreeView.tsx` — Parse tree visualization
- `src/App.tsx` — App layout and stage display

---

This project is for educational purposes and demonstrates the basic steps of compiling and visualizing simple math expressions in a web app.
