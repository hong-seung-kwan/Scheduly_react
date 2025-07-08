import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./features/Home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout></Layout>}>
          <Route path='/' element={<Home></Home>}></Route>
          <Route path='/register' element={" "}></Route>
          <Route path='/login' element={" "}></Route>
          <Route path='/board/list' element={" "}></Route>
          <Route path='/board/register' element={" "}></Route>
          <Route path='/board/read' element={" "}></Route>
          <Route path='/board/modify' element={" "}></Route>
          <Route path='/plan/register' element={" "}></Route>
          <Route path='/plan/modify' element={" "}></Route>
          <Route path='/plan/calendar' element={" "}></Route>
          <Route path='/plan/listview' element={" "}></Route>        
        </Route>
      </Routes>
    </>
  );
}

export default App;
