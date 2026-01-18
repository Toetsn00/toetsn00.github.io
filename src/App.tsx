import HeaderFrame from "./components/HeaderFrame";
import BodyFrame from "./components/BodyFrame";
import FooterFrame from "./components/FooterFrame";
import "./css/App.css";
import "./css/HeaderFrame.css";
import "./css/BodyFrame.css";
import "./css/FooterFrame.css";
import { loadModels } from "./utils/faceModel";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    loadModels();
  }, []);

  return (
    <div>
      <HeaderFrame />
      <BodyFrame />
      <FooterFrame />
    </div>
  );
}

export default App;
