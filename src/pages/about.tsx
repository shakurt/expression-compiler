const About = () => {
  return (
    <section className="container" aria-label="about page container">
      <div className="bg-card mx-auto my-16 max-w-xl rounded p-6 leading-[22px] text-white shadow">
        <h1 className="mb-4 text-center text-2xl font-bold">
          About Expression Compiler Project
        </h1>
        <p className="mb-4 text-sm">
          <span className="text-base font-semibold">Expression Compiler</span>{" "}
          is a web application built for a university compiler course. It
          demonstrates the main concepts of compiling mathematical expressions
          using modern web technologies.
        </p>
        <h2 className="mb-2 text-lg font-semibold">Project Features</h2>
        <ul className="mb-4 list-disc space-y-2 pl-6 text-sm leading-6">
          <li>
            <span className="text-base font-semibold">Lexical Analysis:</span>{" "}
            Tokenizes the input expression into identifiers, numbers, operators,
            parentheses, and functions.
          </li>
          <li>
            <span className="text-base font-semibold">Parsing:</span> Builds an
            Abstract Syntax Tree (AST) from the token stream, supporting
            assignments, binary and unary operations, and function calls.
          </li>
          <li>
            <span className="text-base font-semibold">AST Visualization:</span>{" "}
            Displays the parse tree interactively using a graphical tree view.
          </li>
          <li>
            <span className="text-base font-semibold">Code Generation:</span>{" "}
            Produces three-address code (TAC) from the AST, showing intermediate
            steps for computation.
          </li>
          <li>
            <span className="text-base font-semibold">Validation:</span> Checks
            input for syntax errors, balanced parentheses, and valid
            identifiers.
          </li>
          <li>
            <span className="text-base font-semibold">Modern UI:</span> Built
            with React, TypeScript, and Tailwind CSS for a clean and responsive
            interface.
          </li>
        </ul>
        <h2 className="mb-2 text-lg font-semibold">Technologies Used</h2>
        <ul className="mb-4 list-disc space-y-1 pl-6 text-sm leading-6">
          <li>React & TypeScript</li>
          <li>Vite (build tool)</li>
          <li>Tailwind CSS (styling)</li>
          <li>react-d3-tree (parse tree visualization)</li>
        </ul>
        <h2 className="mb-2 text-lg font-semibold">Author</h2>
        <p className="mb-1 text-sm">
          Project by{" "}
          <a
            href="https://github.com/shakurt"
            target="_blank"
            className="text-base font-semibold underline"
          >
            ThePrimeShak
          </a>
        </p>
        <p className="text-sm text-gray-300">
          <a
            href="https://github.com/shakurt/expression-compiler"
            target="_blank"
            className="underline"
          >
            This Project
          </a>{" "}
          was developed as a practical assignment for the compiler lesson,
          focusing on the implementation of core compiler stages in a
          user-friendly web app.
        </p>
      </div>
    </section>
  );
};
export default About;
