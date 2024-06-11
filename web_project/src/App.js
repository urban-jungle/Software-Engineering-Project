import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Main from "./routes/Main";
import Upload from "./routes/Upload";
import Mail from "./routes/Mail";
import Guest from "./routes/Guest";
import Reply from "./routes/Reply";
import Fix from "./routes/Fix";
import Keyword from "./routes/Keyword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/main" element={<Main />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/DirectMessage" element={<Mail />} />
        <Route path="/guest" element={<Guest />} />
        <Route path="/sendDM" element={<Reply />} />
        <Route path="/fix" element={<Fix />} />
        <Route path="/keyword" element={<Keyword />} />
      </Routes>
    </Router>
  );
}

export default App;