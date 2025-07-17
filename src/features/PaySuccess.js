import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PaySuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("결제 승인 중입니다...");

  useEffect(() => {
    // URL 쿼리에서 pg_token, tid 받아오기
    const query = new URLSearchParams(location.search);
    const pg_token = query.get("pg_token");
    const tid = query.get("tid");

    if (!pg_token || !tid) {
      setMessage("결제 토큰 정보가 없습니다.");
      setTimeout(() => navigate("/"), 3000);
      return;
    }

    // 백엔드에 결제 승인 요청 보내기
    axios
      .get(`/kakao/approve?pg_token=${pg_token}&tid=${tid}`)
      .then((response) => {
        setMessage("결제가 성공적으로 완료되었습니다!");
        // 필요한 후속처리 (예: 유저 등급 업데이트 등)
      })
      .catch((error) => {
        console.error(error);
        setMessage("결제 승인 중 오류가 발생했습니다.");
        setTimeout(() => navigate("/"), 3000);
      });
  }, [location.search, navigate]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>카카오페이 결제</h2>
      <p>{message}</p>
    </div>
  );
};

export default PaySuccess;
