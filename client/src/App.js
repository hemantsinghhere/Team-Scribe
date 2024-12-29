import TextEditor from './components/TextEditor.jsx';
import { v4 as uuidV4 } from 'uuid';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route exact path='/' element={<Navigate to={`/documents/${uuidV4()}`} />} />
          <Route exact path='/documents/:id' element={<TextEditor />} />

          {/* <Route path="*" element={<Error />} /> */}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
