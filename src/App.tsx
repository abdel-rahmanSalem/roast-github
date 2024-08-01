// import "./App.css";
import Footer from "./components/Footer";
import Main from "./components/Main";
import Navbar from "./components/Navbar";
// import ServerDown from "./components/ServerDown";

function App() {
  return (
    <>
      <div className="h-screen bg w-full font-montserrat flex flex-col justify-between bg-slate-950 p-6 text-gray-200">
        <Navbar />
        <Main />
        {/* <ServerDown /> */}
        <Footer />
      </div>
    </>
  );
}

export default App;
