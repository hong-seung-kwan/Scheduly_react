import React, { useContext, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Context } from '..';
import axios from 'axios';
import { Collapse, Radio } from "antd"
import "../css/BoardRegister.css"
import { ChevronDown, FileText, MessageSquareText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BoardRegister = () => {
  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  const [apiPlan, setAPIPlan] = useState([]);
  const { host } = useContext(Context);
  const [board, setBoard] = useState({
    apiPlan: '',
    boardName: '',
    boardContent: ''
  });
  const [apiPlanName, setapiPlanName] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    fetchAPIPlan();
  }, []);

  const fetchAPIPlan = async () => {
    try {
      const res = await axios.get(`${host}/board/register`, {
        headers: { Authorization: token }
      });
      const parsed = res.data.map((plan) => ({
        ...plan,
        apiPlanContentList: JSON.parse(plan.apiPlanContentList)
      }));
      setAPIPlan(parsed);

    } catch (err) {
      console.error(err);
    }
  }

  const handleSave = async () => {
    try {
      await axios.post(`${host}/board/register`, board, {
        headers: {
          Authorization: token,
          "content-type": "application/json",
        },
      })
      navigate("/board/main");
    } catch (error) {
      console.error("등록에 실패했습니다");
    }
  }

  const handleDelete = async () => {
    console.log(selectedApiPlan)
    try {
      await axios.post(`${host}/Api/delete`, selectedApiPlan,
        {
          headers: {
            Authorization: token,
            "content-type": "application/json",
          },
        })
      setapiPlanName('');
      setSelectedApiPlan(null);
      fetchAPIPlan();
    } catch (err) {
      console.log('실패', err)
    }
  }

  const [selectedApiPlan, setSelectedApiPlan] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(new Set());
  const [expandedDetails, setExpandexDetails] = useState({});

  const handleGroupChange = (e) => {
    setSelectedApiPlan(e);
    // setExpandedPlan({...expandedPlan, expandedPlan.add(e))
    setBoard({ ...board, apiPlan: e });
  }

  const handlePlanExpand = (planNo, e) => {
    e.stopPropagation()
    setExpandedPlan((before) => {
      const set = new Set(before);
      if (set.has(planNo)) {
        set.delete(planNo);
      } else {
        set.add(planNo);
      }
      return set;
    })
  }

  const toggleDetailExpantion = (planNo, itemIndex, e) => {
    e.stopPropagation();
    const key = `${planNo}-${itemIndex}`
    setExpandexDetails((before) => ({ ...before, [key]: !before[key] }))
  }

  const isDetailExpanded = (planNo, itemIndex) => {
    const key = `${planNo}-${itemIndex}`
    return expandedDetails[key] || false
  }
  const isPlanExtanded = (planNo) => {
    return expandedPlan.has(planNo)
  }
  return (
    <div className='register-container'>
      <div className='register-wrapper'>
        {/* header */}
        <div className='register-header'>
          <div className='register-title-container'>
            <div className='register-icon'>
              <MessageSquareText />
            </div>
            <h1 className='register-title'>게시글 작성</h1>
          </div>
        </div>
        {/* select */}
        <div className='select-section'>
          <div className='section-div'>
            <h2 className='select-title'>업로드 플랜 선택</h2>
            <button className='select-delete' disabled={selectedApiPlan == null} onClick={() => {
              if (window.confirm("선택한 플랜을 삭제하시겠습니까?")) { handleDelete(); }
            }}>선택한 플랜 삭제</button>
          </div>
          <div className='cards-container'>
            <div className='cards-scroll'>
              {apiPlan.map((plan) => (
                <div key={plan.apiPlanNo} onClick={() => { handleGroupChange(plan.apiPlanNo); setapiPlanName(plan.apiPlanContentList.study); }} className={`card ${selectedApiPlan === plan.apiPlanNo ? "selected" : ""}`}>
                  <div className='card-header'>
                    <h3 className='card-title'>{plan.apiPlanContentList.study}</h3>
                    <button className='card-expand-btn' onClick={(e) => {
                      handlePlanExpand(plan.apiPlanNo, e);
                    }}>
                      <ChevronDown className={`card-expand-icon ${isPlanExtanded(plan.apiPlanNo) ? "expanded" : ""}`} />
                    </button>
                  </div>
                  {isPlanExtanded(plan.apiPlanNo) && (
                    <div className='details'>
                      <div className='details-list'>
                        {plan.apiPlanContentList.list.map((item, index) => (
                          <div className='detail-item' key={index}>
                            <div className='detail-header' onClick={(e) => toggleDetailExpantion(plan.apiPlanNo, index, e)}>
                              <div className='detail-header-content'>
                                <span className='detail-date'>{item.date}</span>
                                <span>{item.content}</span>
                              </div>
                              <ChevronDown className={`detail-toggle ${isDetailExpanded(plan.apiPlanNo, index) ? "expanded" : ""}`} />
                            </div>
                            {isDetailExpanded(plan.apiPlanNo, index) && (
                              <div className='detail-content'>
                                <div className='detail-description'>세부 내용:</div>
                                <ul className='detail-list'>
                                  {item.details.map((detail, i) => (
                                    <li key={i}>{detail.detail}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* input창 */}
        <div className="form-section">
          <h2 className="form-title">
            <FileText className="btn-icon" style={{ display: "inline", marginRight: "0.5rem" }} />
            게시글 정보
          </h2>
          <div className="form-group">
            <label className="form-label">선택된 플랜</label>
            <input type="text" className="form-input" value={apiPlanName} placeholder="플랜을 선택하세요" readOnly />
          </div>

          <div className="form-group">
            <label className="form-label">게시글 제목</label>
            <input type="text" className="form-input" value={board.boardName} onChange={(e) => setBoard({ ...board, boardName: e.target.value })} placeholder="제목을 입력하세요" />
          </div>

          <div className="form-group">
            <label className="form-label">게시글 내용</label>
            <textarea className="form-input form-textarea" value={board.boardContent} onChange={(e) => setBoard({ ...board, boardContent: e.target.value })} placeholder="내용을 입력하세요" />
          </div>

          <div className="submitDiv">
            <button onClick={handleSave} className="btn-submit" disabled={!board.apiPlan || !board.boardName || !board.boardContent}>
              <Send className="btn-icon" />
              등록
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BoardRegister