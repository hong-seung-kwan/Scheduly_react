import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./features/Home";
import Register from "./features/Register";

import Board from "./features/Board";
import PlanRegister from "./features/PlanRegister";
import PaySuccess from "./features/PaySuccess";
import PlanListView from "./features/PlanListView";
import Login from "./features/Login";
import BoardRegister from "./features/BoardRegister";


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout></Layout>}>
          <Route path='/' element={<Home></Home>}></Route>
          <Route path='/register' element={<Register></Register>}></Route>
          <Route path='/login' element={<Login></Login>}></Route>
          <Route path='/board/main' element={<Board/>}></Route>
          <Route path='/board/list' element={" "}></Route>
          <Route path='/board/register' element={<BoardRegister/>}></Route>
          <Route path='/board/read' element={" "}></Route>
          <Route path='/board/modify' element={" "}></Route>
          <Route path='/plan/register' element={<PlanRegister/>}></Route>
          <Route path='/plan/modify' element={" "}></Route>
          <Route path='/plan/calendar' element={" "}></Route>
          <Route path='/plan/listview/:planNo' element={<PlanListView/>}></Route>
          <Route path='/pay/success' element={<PaySuccess/>}></Route>
          <Route path='/pay/cancel' element={" "}></Route>
          <Route path='/pay/fail' element={" "}></Route> 

        </Route>
      </Routes>
    </>
  );
}

export default App;
