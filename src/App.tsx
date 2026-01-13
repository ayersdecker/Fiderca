import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Connections from './pages/Connections';
import Vaults from './pages/Vaults';
import Calendar from './pages/Calendar';
import Search from './pages/Search';

function App() {
  return (
    <BrowserRouter basename="/Fiderca">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="connections" element={<Connections />} />
          <Route path="vaults" element={<Vaults />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
