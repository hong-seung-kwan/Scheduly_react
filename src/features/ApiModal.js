import { useContext, useEffect, useState } from "react";
import "../css/ApiModal.css";
import { useDispatch, useSelector } from "react-redux";
import { Context } from "..";
import axios from "axios";

export const Modal = ({ openModal, setOpenModal, sharedPlan, onSaveSuccess }) => {
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
          ...plan.list.map(item => {
            const detailsText = item.details
              .map(detail => ` -${detail.detail}`)
              .join("\n");

            return `${item.date}: ${item.content}\n${detailsText}`;
          })

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
          gptJson: JSON.stringify(currentPlan),
        }

        const response = await axios.post(`${host}/gpt/fixPlan`, JSON.stringify(body), {

          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          }
        });
        const plan = response.data;
        setCurrentPlan(plan)
        const replyText = [
          plan.study,
          "",
          ...plan.list.map(item => {
            const detailsText = item.details
              .map(detail => ` -${detail.detail}`)
              .join("\n");

            return `${item.date}: ${item.content}\n${detailsText}`;
          })

        ].join("\n");
        setChatMessages(prev => [...prev, { sender: "system", text: replyText }]);
        setMessage("");
        console.log(typeof currentPlan);

      } catch (error) {
        console.error("에러 발생:", error);
        alert("플랜 생성에 실패하였습니다")
      }
    }
  }



  const handleSave = async () => {
    console.log("handleSave 실행됨");
    try {
      const response = await axios.post(`${host}/gpt/savePlan`, currentPlan, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        }
      });

      const planNo = response.data;
      
      alert("플랜이 저장되었습니다!");
      // setReload(prev => !prev);

      if (onSaveSuccess) {
        onSaveSuccess();
        
      }


    } catch (error) {
      console.error("플랜 저장 실패:", error);
      alert("플랜 저장 실패");
    }
  };

  useEffect(() => {
    if (sharedPlan && sharedPlan.study && sharedPlan.list) {
      const replyText = [
        sharedPlan.study,
        "",
        ...sharedPlan.list.map(item => {
          const detailsText = item.details
            .map(detail => ` -${detail.detail}`)
            .join("\n");
          return `${item.date}: ${item.content}\n${detailsText}`;
        })
      ].join("\n")

      setChatMessages([{ sender: "system", text: replyText }]);
      setCurrentPlan(sharedPlan);
    }
  }, [sharedPlan]);



  return (
    <div className="overlay">
      <div className="modal-container">
        <button className='close-btn' onClick={() => { setOpenModal(false) }}>✖</button>
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
          <div className="button-wrapper">
          <button className="send-btn" onClick={handleSend}>전송</button>
          <button className="send-btn" onClick={handleSave}>저장</button>
          </div>
        </div>

      </div>

    </div>
  )
}