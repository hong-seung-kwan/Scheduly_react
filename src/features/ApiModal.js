import { useContext, useState } from "react";
import "../css/ApiModal.css";
import { useSelector } from "react-redux";
import { Context } from "..";
import axios from "axios";

export const Modal = ({openModal, setOpenModal}) => {

    const [message, setMessage] = useState("");
    const user = useSelector((state) => state.member.info);
    const token = useSelector((state) => state.member.token);
    const { host } = useContext(Context)

     const handleSend = async () => {
    try {
      // 1. GPT에게 계획 생성 요청
      const gptResponse = await axios.post(`${host}/gpt/createPlan`, message, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      const generatedPlanJson = gptResponse.data;

      // 2. 서버에 계획 저장 요청
      const saveResponse = await axios.post(
        `${host}/plan/api?userNo=${user.userNo}`,
        generatedPlanJson,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      alert("플랜이 성공적으로 등록되었습니다!");
      setOpenModal(false);
    } catch (error) {
      console.error("에러 발생:", error);
      alert("플랜 등록에 실패했습니다.");
    }
  };


    return (
        <div className="overlay">
            <div className="modal-container">
                <h2>API</h2>
                <div className="chat-box"></div>
                <div className="input-div">
                    <input 
                        type="text"
                        className="msg-input"
                        value={message}
                        onChange={(e)=> setMessage(e.target.value)}
                        placeholder="예: 정보처리기사 2주간 공부 계획 짜줘"
                        ></input>
                    <button className="cancle" type="button" onClick={()=>{
                        setOpenModal(false);
                    }}>취소</button>
                    <button className="send-button" onClick={handleSend}>확인</button>
                </div>

            </div>

        </div>
    )
}