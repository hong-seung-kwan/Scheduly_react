import React, { useContext, useEffect, useState } from 'react'
import '../css/PlanListView.css';
import { useSelector } from 'react-redux';
import { Context } from '..';
import axios from 'axios';
const PlanListView = () => {


    const user = useSelector((state) => state.member.info);
    const token = useSelector((state) => state.member.token);
    const { host } = useContext(Context)
    const [plans, setPlans] = useState([])
    const [selectedPlanId, setSelectedPlanId] = useState(null)
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editingText, setEditingText] = useState("")
    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId)


    // try {
    //             const response = await axios.get(`${host}/list`, {
    //                 headers: {
    //                     authorization: token
    //                 }
    //             });

    //             if (response.status === 200) {
    //                 const selPlan = response.data.map(planDay => ({
    //                     id: planDay.planDayNo,
    //                     name: planDay.planDayContent,
    //                     dates: [{
    //                         dateLabel: planDay.planDayDate,
    //                         tasks: planDay.details.map((d, index) => ({
    //                             id: index,
    //                             task: d.detail,
    //                             status: d.detailStatus === "FINISHED"
    //                         }))
    //                     }]
    //                 }));

    //                 setPlans(selPlan);
    //             }
    //         } catch (error) {
    //             console.error("플랜 데이터 불러오기실패", error);
    //         }





    useEffect(() => {

        const apicall = async () => {
            try {
                const response = await axios.get(`${host}/plan/list`, {
                    headers: {
                        authorization: token
                    }
                });

                if (response.status === 200) {
                    const Plans = response.data.map(plan => ({
                        id: plan.planNo,
                        name: plan.planName,
                        Planstatus: plan.status
                    }));

                    setPlans(Plans);
                }
            } catch (error) {
                console.error("플랜 데이터 불러오기실패", error);
            }
        }
        apicall();
    }, [host, token]);

    return (
        <div className='plans-tab-container'>
            <div className='plans-tab-header'>
                <h2>플랜 조회</h2>
                <p>플랜을 선택하여 조회하세요</p>
            </div>

            <div className='plans-tabs'>
                {plans.map((plan) => {
                    // const stats = getPlanStats(plan)
                    return (
                        <button
                            key={plan.id}
                            className={`plan-tab ${selectedPlanId === plan.id ? "active" : ""}`}
                            onClick={""}

                        >
                            {plan.name}
                            <span className='plan-tab-badge'>
                                {/* {stats.completed}/{stats.total} */}
                            </span>
                        </button>
                    )
                })}
            </div>

            {selectedPlan ? (
                <div className="plan-detail-container">
                    <div className="plan-detail-header">
                        <h3 className="plan-detail-title">{selectedPlan.name}</h3>
                        <div className="plan-detail-stats">
                            {(() => {
                                // const stats = getPlanStats(selectedPlan)
                                return (
                                    <>
                                        <div className="plan-detail-stat">
                                            <span className="plan-detail-stat-number">1</span>
                                            <span className="plan-detail-stat-label">완료</span>
                                        </div>
                                        <div className="plan-detail-stat">
                                            <span className="plan-detail-stat-number">4</span>
                                            <span className="plan-detail-stat-label">남은 일</span>
                                        </div>
                                        <div className="plan-detail-stat">
                                            <span className="plan-detail-stat-number">5</span>
                                            <span className="plan-detail-stat-label">전체</span>
                                        </div>
                                    </>
                                )
                            })()}
                        </div>
                    </div>

                    {selectedPlan.dates.length === 0 ? (
                        <div className="no-dates">
                            <p>이 플랜에는 등록된 날짜가 없습니다.</p>
                        </div>
                    ) : (
                        <div className="plan-dates-list">
                            {selectedPlan.dates.map((dateInfo, dateIndex) => (
                                <div key={dateIndex} className="plan-date-card">
                                    <div className="plan-date-header">{dateInfo.dateLabel}</div>
                                    <div className="plan-date-content">
                                        {dateInfo.tasks.length === 0 ? (
                                            <div style={{ textAlign: "center", color: "#6c757d", padding: "1rem" }}>
                                                <p>이 날짜에는 할일이 없습니다.</p>
                                            </div>
                                        ) : (
                                            <div className="plan-date-tasks">
                                                {dateInfo.tasks.map((task) => (
                                                    <div key={task.id} className={`plan-date-task ${task.status ? "completed" : ""}`}>
                                                        {/* 체크박스 */}
                                                        <div className="plan-date-task-checkbox">
                                                            <input
                                                                type="checkbox"
                                                                checked={task.status}
                                                            // onChange={() => toggleTaskStatus(task.id, task.planDayNo, task.detailIndex)}
                                                            />
                                                            <span className="plan-date-checkmark"></span>
                                                        </div>

                                                        {/* 할일 내용 */}
                                                        <div className="plan-date-task-content">
                                                            {editingTaskId === task.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="plan-date-edit-input"
                                                                    value={editingText}
                                                                    onChange={(e) => setEditingText(e.target.value)}
                                                                    // onKeyDown={(e) => {
                                                                    //     if (e.key === "Enter") {
                                                                    //         saveEdit(task.id)
                                                                    //     } else if (e.key === "Escape") {
                                                                    //         cancelEditing()
                                                                    //     }
                                                                    // }}
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span className="plan-date-task-text">{task.task}</span>
                                                            )}
                                                        </div>

                                                        {/* 액션 버튼들 */}
                                                        <div className="plan-date-task-actions">
                                                            {editingTaskId === task.id ? (
                                                                <>
                                                                    <button className="save-btn" onClick={""} title="저장">
                                                                        ✓
                                                                    </button>
                                                                    <button className="cancel-btn" onClick={""} title="취소">
                                                                        ✕
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        className="edit-btn"
                                                                        onClick={""}
                                                                        title="수정"
                                                                    >
                                                                        ✏️
                                                                    </button>
                                                                    <button className="delete-btn" onClick={""} title="삭제">
                                                                        ×
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="empty-plan-detail">
                    <h3>플랜을 선택해주세요</h3>
                    <p>위의 탭에서 플랜을 선택하면 세부 내용을 확인할 수 있습니다.</p>
                </div>
            )}
        </div>





    )




}

export default PlanListView