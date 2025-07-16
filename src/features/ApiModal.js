import { useContext, useState } from "react";
import "../css/ApiModal.css";
import { useSelector } from "react-redux";
import { Context } from "..";
import axios from "axios";

export const Modal = ({ openModal, setOpenModal }) => {

  const [message, setMessage] = useState("");
  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  const [reload, setReload] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentPlan, setCurrentPlan] = useState([]);

  const { host } = useContext(Context)

  const handleSend = async () => {
    
    setChatMessages(prev => [...prev, { sender: "user", text: message }]);
    if (chatMessages.length === 0) {
      try {
        const response = await axios.post(`${host}/gpt/createPlan`, JSON.stringify(message), {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        });
        const plan = response.data;

        setCurrentPlan(JSON.stringify(plan));
        const replyText = [
          plan.study,
          "",
          ...plan.list.map(item => `${item.date}: ${item.content}`)
        ].join("\n");
        setChatMessages(prev => [...prev, { sender: "system", text: replyText }]);
        setMessage("");
      } catch (error) {
        console.error("에러 발생:", error);
        alert("플랜 생성에 실패하였습니다")
      }
    } else {
      try {

        const body = {
          userOrder: message,
          gptJson: currentPlan,
        }

        const response = await axios.post(`${host}/gpt/fixPlan`, JSON.stringify(body), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const plan = response.data;
        setCurrentPlan(JSON.stringify(plan))
        const replyText = [
          plan.study,
          "",
          ...plan.list.map(item => `${item.date}: ${item.content}`)
        ].join("\n");
        setChatMessages(prev => [...prev, { sender: "system", text: replyText }]);
        setMessage("");

      } catch (error) {
        console.error("에러 발생:", error);
        alert("플랜 생성에 실패하였습니다")
      }
    }
  }



  const handleSave = async () => {
    setChatMessages(prev => [...prev, { sender: "user", text: message }]);
    try {
      // 1. GPT에게 계획 생성 요청
      const response = await axios.post(`${host}/gpt/savePlan`, message, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      const plan = JSON.parse(response.data.message);
      const replyText = [
        plan.study,
        "",
        ...plan.list.map(item => `${item.date}: ${item.content}`)
      ].join("\n");
      setChatMessages(prev => [...prev, { sender: "system", text: replyText }]);
      setMessage("");

      setReload(prev => !prev);
    } catch (error) {
      console.error("에러 발생:", error);
      alert("플랜 등록에 실패했습니다.");
    }
  };


  return (
    <div className="overlay">
      <div className="modal-container">
        <h2>API</h2>
        <div className="chat-box">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-div">
          <input
            type="text"
            className="msg-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예: 정보처리기사 2주간 공부 계획 짜줘"
          ></input>
          <button className="cancle" type="button" onClick={() => {
            setOpenModal(false);
          }}>취소</button>
          <button className="send-button" onClick={handleSend}>확인</button>
        </div>

      </div>

    </div>
  )
}