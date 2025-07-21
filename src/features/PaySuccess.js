import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Context } from "../index";
import { useDispatch, useSelector } from "react-redux";
import { updateUserInfo } from "../store/memberSlice";

const PaySuccess = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { host } = useContext(Context);
  const token = useSelector((state) => state.member.token);

  const [message, setMessage] = useState("결제 승인 중입니다...");

  useEffect(() => {
    // URL 쿼리에서 pg_token, tid 받아오기
    const query = new URLSearchParams(location.search);
    const pg_token = query.get("pg_token");
    // const tid = query.get("tid");

    const tid = localStorage.getItem("kakao_tid");
    const userNo = localStorage.getItem("userNo");

    if (!pg_token || !tid || !userNo) {
      setMessage("결제 토큰 정보가 없습니다.");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    // 백엔드에 결제 승인 요청 보내기
    axios
      .post(`${host}/kakao/approve`, {
        pg_token,
        tid,
        userNo
      },{
        headers:{
          Authorization: token
        }
      })
      .then((response) => {
        alert("결제가 성공적으로 완료되었습니다!");
        const {user} = response.data;
        dispatch(updateUserInfo(user));
        localStorage.setItem('user', JSON.stringify(user));
        navigate("/")
      })
      .catch((error) => {
        console.error(error);
        setMessage("결제 승인 중 오류가 발생했습니다.");
        setTimeout(() => navigate("/"), 3000);
      });
  }, [location.search, navigate, dispatch]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>카카오페이 결제</h2>
      <p>{message}</p>
    </div>
  );
};

export default PaySuccess;
