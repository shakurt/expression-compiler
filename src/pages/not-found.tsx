import { useNavigate } from "react-router";

const NotFound = () => {
  const navigation = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-white">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-white">
          Page Not Found
        </h2>
        <p className="mb-8 text-gray-400">
          The page you're looking for doesn't exist.
        </p>
        <button
          className="bg-primary hover:bg-primary/80 cursor-pointer rounded px-4 py-2 text-white transition-colors"
          type="button"
          onClick={() => navigation("/")}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;
