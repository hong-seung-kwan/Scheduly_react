import { useContext, useState } from "react";
import { useSelector } from "react-redux"
import { Context } from "..";
import "../css/PlanRegister.css"
import { Calendar, FileText, PenTool, Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
const PlanRegister = () => {
  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  const { host } = useContext(Context);
  const navigate = useNavigate();
  const [plan, setPlan] = useState({
    study: '',
    list: [
      {
        date: '',
        content: '',
        details: [{ detail: '' }]
      }]
  });
  const handlePlanNameChange = (e) => {
    setPlan({ ...plan, study: e.target.value });
  }

  const addList = () => {
    setPlan({
      ...plan,
      list: [
        ...plan.list,
        {
          date: '',
          content: '',
          details: [{ detail: '' }]
        }
      ]
    });
  };

  const handleSave = async () => {
    try {
      await axios.post(`${host}/gpt/savePlan`, plan,
        {
          headers: {
            Authorization: token,
            "content-type": "application/json",
          },
        }
      );
      navigate("/");
    } catch (error) {
      console.error("에러 발생:", error);
      alert("플랜 등록에 실패했습니다");
    }
  }

  const handleListChange = (index, field, value) => {
    const updatedList = [...plan.list];
    updatedList[index][field] = value;
    setPlan({ ...plan, list: updatedList });
  }

  const removeList = (dayIndex) => {
    setPlan((prev) => ({
      ...prev, list: prev.list.filter((_, i) => i !== dayIndex),
    }));
  };

  const addDetail = (listIndex) => {
    const updatedList = [...plan.list];
    updatedList[listIndex].details.push({ detail: '' });
    setPlan({ ...plan, list: updatedList });
  };

  const handleDetailChange = (dayIndex, detailIndex, field, value) => {
    const updatedList = [...plan.list];
    updatedList[dayIndex].details[detailIndex][field] = value;
    setPlan({ ...plan, list: updatedList });
  };

  const removeDetail = (dayIndex, detailIndex) => {
    setPlan((prev) => {
      const updatedList = [...prev.list];
      updatedList[dayIndex].details = updatedList[dayIndex].details.filter((_, i) => i !== detailIndex);
      return { ...prev, list: updatedList };
    });
  };

  return (
    <div className="plan-container">
      <div className="plan-wrapper">
        {/* Header */}
        <div className="plan-header">
          <div className="plan-title-container">
            <div className="plan-icon">
              <PenTool />
            </div>
            <h1 className="plan-title">플랜 작성</h1>
          </div>
          <p className="plan-description">체계적인 학습 계획을 세워보세요</p>
        </div>

        <div className="plan-form">
          {/* Plan Name Section */}
          <div className="plan-name-section">
            <label className="plan-name-label">플랜 제목</label>
            <input
              type="text"
              className="plan-name-input"
              placeholder="예: 자바스크립트 마스터하기"
              value={plan.study}
              onChange={handlePlanNameChange}
            />
          </div>

          {/* Day Cards */}
          <div className="day-cards-container">
            {plan.list.map((day, dayIndex) => (
              <div key={dayIndex} className="day-card">
                <div className="day-card-header">
                  <h3 className="day-card-title">
                    <Calendar className="btn-icon" style={{ display: "inline", marginRight: "0.5rem" }} />
                    Day {dayIndex + 1}
                  </h3>
                  <button
                    onClick={() => removeList(dayIndex)}
                    className="btn btn-danger btn-small"
                    disabled={plan.list.length === 1}
                  >
                    <Trash2 className="btn-icon" />
                    삭제
                  </button>
                </div>

                <div className="day-inputs">
                  <input
                    type="date"
                    className="form-input"
                    value={day.date}
                    onChange={(e) => handleListChange(dayIndex, "date", e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="오늘의 학습 목표를 입력하세요"
                    value={day.content}
                    onChange={(e) => handleListChange(dayIndex, "content", e.target.value)}
                  />
                </div>

                <div className="details-section">
                  <div className="details-header">
                    <h4 className="details-title">
                      <FileText className="btn-icon" style={{ display: "inline", marginRight: "0.5rem" }} />
                      세부 계획
                    </h4>
                    <button onClick={() => addDetail(dayIndex)} className="btn btn-secondary btn-small">
                      <Plus className="btn-icon" />
                      추가
                    </button>
                  </div>

                  {day.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="detail-item">
                      <input
                        type="text"
                        className="detail-input"
                        placeholder="구체적인 학습 내용을 입력하세요"
                        value={detail.detail}
                        onChange={(e) => handleDetailChange(dayIndex, detailIndex, "detail", e.target.value)}
                      />
                      <button
                        onClick={() => removeDetail(dayIndex, detailIndex)}
                        className="btn btn-danger btn-small"
                        disabled={day.details.length === 1}
                      >
                        <Trash2 className="btn-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add Day Section */}
          <div className="add-day-section">
            <button onClick={addList} className="btn btn-secondary">
              <Plus className="btn-icon" />
              새로운 날짜 추가
            </button>
          </div>

          {/* Save Section */}
          <div className="save-section">
            <button onClick={handleSave} className="btn btn-primary btn-large">
              <PenTool className="btn-icon" />
              플랜 저장하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanRegister