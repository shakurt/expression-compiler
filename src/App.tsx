import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Route, Routes } from "react-router";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import NotFoundPage from "@/pages/not-found";

const App = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
