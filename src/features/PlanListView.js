import React, { useContext, useEffect, useState } from 'react'
import '../css/PlanListView.css';
import { useSelector } from 'react-redux';
import { Context } from '..';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import DatePicker, { registerLocale } from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ko from "date-fns/locale/ko";
registerLocale("ko", ko);

const PlanListView = () => {

    const [editingPlanName, setEditingPlanName] = useState(false)
    const user = useSelector((state) => state.member.info);
    const token = useSelector((state) => state.member.token);
    const { host } = useContext(Context)
    const [plans, setPlans] = useState([])
    const [planDayList, setPlanDayList] = useState([]);
    const [editingTaskId, setEditingTaskId] = useState(null)
    const [editingText, setEditingText] = useState("")
    const [reload, setReload] = useState(false);
    const [loading, setLoading] = useState(false)
    const [planStatus, setPlanStatus] = useState("");
    const navigate = useNavigate();


    const { planNo } = useParams();
    const location = useLocation();
    const planName = location.state?.planName;
    const [planNameText, setPlanNameText] = useState("");

    // 통계
    const getStats = () => {
        const allTasks = planDayList.flatMap((day) => day.tasks)
        const completed = allTasks.filter((task) => task.status === "FINISHED").length
        const total = allTasks.length
        const remaining = total - completed
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

        return { completed, total, remaining, completionRate };
    }

    const stats = getStats()



    const toggleTaskStatus = async (id, planDayNo, detailIndex) => {
        console.log("status 호출됨:", { id, planDayNo, detailIndex });

        const task = planDayList.flatMap(day => day.tasks).find(t => t.id === id);
        if (!task) return;

        const updateStatus = task.status === "FINISHED" ? "BEFORE" : "FINISHED";

        try {
            await axios.post(`${host}/jsonstatus`, { planDayNo, detailIndex }, {
                headers: { Authorization: token }
            });

            setPlanDayList(prev =>
                prev.map(day => ({
                    ...day,
                    tasks: day.tasks.map(task =>
                        task.id === id ? { ...task, status: updateStatus } : task
                    )
                }))
            );
        } catch (error) {
            console.log("실패", error);
        }
    };

    const toggleAllTaskStatus = async (planDayNo) => {
        try {
            await axios.post(`${host}/allstatus`, {
                planDayNo
            },
                {
                    headers: {
                        Authorization: token,
                    }
                })

            setPlanDayList((prev) =>
                prev.map((day) => {
                    if (day.planDayNo === planDayNo) {
                        const isAllFinished = day.tasks.every(task => task.status === "FINISHED")
                        const newStatus = isAllFinished ? "BEFORE" : "FINISHED";

                        const updatedTasks = day.tasks.map(task => ({
                            ...task,
                            status: newStatus
                        }))
                        console.log("업데이트된 tasks:", updatedTasks);
                        return { ...day, tasks: updatedTasks }
                    }
                    return day;
                })
            )

        } catch (err) {
            console.error("상태 변경 실패", err);
        }
    }


    const startEditingTask = (taskId, currentText) => {
        setEditingTaskId(taskId)
        setEditingText(currentText)
    }

    // 플랜 이름 수정
    const handleSavePlanName = async () => {
        try {
            const response = await axios.post(`${host}/plan/modify`, {
                planNo: planNo,
                planName: planNameText,
            }, {
                headers: {
                    Authorization: token,
                }
            })
            if (response.status === 200) {
                setPlanNameText(planNameText);
                setEditingPlanName(false);
            }
        } catch (error) {
            console.log("이름 수정 실패", error);
        }
    }

    // 세부 일정 수정
    const handlesaveEdit = async (id, planDayNo, detailIndex) => {

        if (editingText.trim() === "") return;

        try {
            const updatedTask = {
                planDayNo,
                detailIndex,
                detail: editingText.trim(),
            };

            console.log(updatedTask)

            await axios.post(`${host}/jsonmodify`, updatedTask, {

                headers: {
                    Authorization: token
                }
            });


            setPlanDayList((prev) =>
                prev
                    .map(day => ({
                        ...day,
                        tasks: day.tasks.map((task) =>
                            task.id === id ? { ...task, task: editingText.trim() } : task
                        ),
                    }))
            );

            setEditingTaskId(null);
            setEditingText("");
            setReload((prev) => !prev);
        } catch (err) {
            console.log("수정 실패", err);
        }
    };

    // 세부 일정 삭제
    const handleDeleteTask = async (planDayNo, detailIndex) => {
        try {
            await axios.post(`${host}/removeJson`, { planDayNo, detailIndex }, {
                headers: {
                    Authorization: token
                }
            })

            setPlanDayList((prev) => {
                return prev
                    .map((day) => {
                        if (day.planDayNo === planDayNo) {

                            return {
                                ...day,
                                tasks: day.tasks.filter((_, idx) => idx !== detailIndex)
                            }
                        } else {

                            return day;
                        }
                    })
                    .filter(day => day.tasks.length > 0);
            });



            setReload(prev => !prev);
        } catch (err) {
            console.log("삭제 실패", err);
        }
    }

    // 플랜 상태 변경
    const completePlan = async () => {
        try {
            const response = await axios.post(`${host}/plan/${planNo}/complete`, null, {
                headers: {
                    Authorization: token
                }
            })
            console.log("플랜 완료", response.data);
            setPlanStatus("FINISHED");
        } catch (err) {
            console.error("플랜 완료 실패", err);
        }
    }
    const isPlanFinished = planDayList.length > 0 && planDayList.flatMap(day => day.tasks).every(task => task.status === "FINISHED");


    // 날짜 하루 밀기, 당기기
    const pushPullDate = async (direction, planNo, planDayNo) => {
        try {
            const endpoint = direction === "push" ? "/pushDate" : "/pullDate";

            const response = await axios.post(`${host}${endpoint}`, null, {
                params: {
                    planNo,
                    planDayNo
                },
                headers: {
                    Authorization: token
                }
            })

            if (response.status === 200) {
                const updatedList = response.data.map(planDay => ({
                    date: planDay.planDayDate,
                    planDayNo: planDay.planDayNo,
                    tasks: planDay.details.map((d, i) => ({
                        id: `${planDay.planDayNo} - ${i}`,
                        task: d.detail,
                        status: d.detailStatus
                    }))
                }))

                setPlanDayList(updatedList)
            }

        } catch (error) {
            console.error("날짜 이동 실패", error);
        }
    }
    // 플랜 전체 삭제
    const removePlan = async (planNo) => {
        const confirm = window.confirm("플랜을 삭제하시겠습니까??");
        if (!confirm) return;

        console.log("삭제 요청 planNo:", planNo);

        try {
            const response = await axios.post(`${host}/plan/removePlan`, null, {
                params: {
                    planNo,
                },
                headers: {
                    Authorization: token
                }
            })
            if (response.status === 200 || response.status === 202) {
                alert("플랜이 삭제되었습니다.")
                navigate("/");

            }
        } catch (err) {
            console.error("플랜 삭제 실패", err);
        }
    }
    // 플랜 내보내기
    const planShare = async (planNo) => {
        try {
            const response = await axios.post(`${host}/Api/${planNo}`, null, {
                headers: {
                    Authorization: token
                }
            })
            if (response.status === 200) {
                alert("플랜 내보내기 완료")
            }
        } catch (err) {
            console.log("플랜 공유 실패", err);
        }
    }

    // 날짜 변경 재정렬
    const reArray = async (planNo, date) => {
        try {
            const response = await axios.post(`${host}/reArray`, null, {
                params: {
                    planNo,
                    date: date.toISOString().split('T')[0], // yyyy-MM-dd 형식
                },
                headers: {
                    Authorization: token
                }
            });

            const updatedList = response.data.map(planDay => ({
                date: planDay.planDayDate,
                planDayNo: planDay.planDayNo,
                tasks: planDay.details.map((d, i) => ({
                    id: `${planDay.planDayNo} - ${i}`,
                    task: d.detail,
                    status: d.detailStatus
                }))
            }));

            setPlanDayList(updatedList);
        } catch (err) {
            console.error("reArray 실패", err);
        }
    };


    useEffect(() => {
        if (!planNo) return;

        console.log(planName);
        console.log(planDayList);



        const fetchPlanName = async () => {
            try {
                const response = await axios.get(`${host}/plan/${planNo}`, {
                    headers: {
                        Authorization: token
                    }
                });
                setPlanNameText(response.data.planName);
                setPlanStatus(response.data.status);
                console.log(response.data);
            } catch (err) {
                console.error("에러:", err);
                if (err.response) {
                    console.error("상태코드:", err.response.status);
                    console.error("응답내용:", err.response.data);
                }
            }
        };


        const fetchPlanDayList = async (planNo) => {
            try {
                const response = await axios.get(`${host}/planDayList`, {
                    params: { planNo },
                    headers: {
                        Authorization: token
                    }
                })

                const data = response.data.map(planDay => ({
                    date: planDay.planDayDate,
                    planDayNo: planDay.planDayNo,
                    planDayContent: planDay.planDayContent,
                    tasks: planDay.details.map((d, i) => ({
                        id: `${planDay.planDayNo} - ${i}`,
                        task: d.detail,
                        status: d.detailStatus

                    }))
                }))
                setPlanDayList(data);
            } catch (err) {
                console.error("목록 불러오기 실패", err);
            }
        }
        fetchPlanDayList(planNo);
        fetchPlanName();
    }, [host, token, planNo]);

    useEffect(() => {
        const allTasks = planDayList.flatMap((day) => day.tasks);
        const allFinished = allTasks.length > 0 && allTasks.every((task) => task.status === "FINISHED");

        if (allFinished) {
            completePlan();
        }
    }, [planDayList])

    const handleSaveTask = (dataLabel, taskId) => {
        setEditingTaskId(null);
    }



    if (!planNo) {
        return <div>선택된 플랜이 없습니다.</div>
    }

    return (
        <div className='plan-container'>
            <div className='plan-header'>
                <h2>📋 플랜 상세 조회</h2>
            </div>
            <div className="plan-detail-container">
                <div className='plan-detail-header'>
                    {editingPlanName ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", width: "fit-content" }}>
                            <input
                                type='text'
                                className='plan-title-input'
                                value={planNameText}
                                onChange={(e) => setPlanNameText(e.target.value)}
                                autoFocus
                            />
                            <button className='plan-title-edit-btn' onClick={handleSavePlanName}>✓</button>
                            <button className='plan-title-edit-btn' onClick={() => {
                                console.log("✕ clicked");
                                setEditingPlanName(false);
                                setPlanNameText(planName);
                            }}>✕</button>
                        </div>
                    ) : (

                        <h3 className='plan-detail-title'>


                            <span
                                style={{
                                    textDecoration: isPlanFinished ? "line-through" : "none"
                                }}
                            >{planNameText}
                            </span>
                            <button className='plan-title-edit-btn' onClick={() => setEditingPlanName(true)}>
                                ✏️
                            </button>
                            <button className='plan-title-delete-btn' onClick={() => removePlan(planNo)}>
                                <Trash2 size={'1.18rem'} />
                            </button>
                            {isPlanFinished && (
                                <span style={{ marginLeft: '8px', color: 'red', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center' }}>완료된 플랜</span>
                            )}

                        </h3>

                    )}
                    <div className='plan-action'>
                        <button className='plan-action-btn' onClick={() => planShare(planNo)}>📤 내보내기</button>
                    </div>
                </div>

                {/* 통계 */}
                <div className='plan-stats'>
                    <div className='plan-stat-card'>
                        <span className='plan-stat-number'>{stats.completed}</span>
                        <span className='plan-stat-label'>완료된 할일</span>
                    </div>
                    <div className='plan-stat-card'>
                        <span className='plan-stat-number'>{stats.remaining}</span>
                        <span className='plan-stat-label'>남은 할일</span>
                    </div>
                    <div className='plan-stat-card'>
                        <span className='plan-stat-number'>{stats.total}</span>
                        <span className='plan-stat-label'>전체 할일</span>
                    </div>
                    <div className='plan-stat-card'>
                        <span className='plan-stat-number'>{stats.completionRate}%</span>
                        <span className='plan-stat-label'>완료율</span>
                    </div>
                </div>

                {/* 날짜별 할일 */}
                {loading ? (
                    <div className='loading'>
                        <div className='loading-spinner'></div>
                    </div>
                ) : planDayList.length === 0 ? (
                    <div className='empty-plan'>
                        <div className='empty-plan-icon'>📅</div>
                        <h3>등록된 할일이 없습니다</h3>
                        <p>새로운 할일을 추가하여 플랜을 완성해보세요!!!</p>
                    </div>
                ) : (
                    planDayList.map((dayData, dayIndex) => {
                        const isAllFinished = dayData.tasks.every(task => task.status === "FINISHED");

                        return (
                            <div key={dayIndex} className='plan-date-card'>
                                <div className='plan-date-header'>
                                    <div className='checkbox-date-wrapper'>
                                        <div className='task-checkbox'>
                                            <input
                                                type="checkbox"
                                                checked={isAllFinished}
                                                onChange={() => toggleAllTaskStatus(dayData.planDayNo)}
                                                className="day-status-checkbox"
                                            />
                                        </div>
                                        <div className='date-content'>
                                            <span >{dayData.date}
                                                {dayIndex === 0 && (
                                            <DatePicker
                                                selected={new Date(dayData.date)}
                                                onChange={(date) => reArray(planNo, date)}
                                                dateFormat="yyyy-MM-dd"
                                                
                                                locale="ko"
                                                customInput={
                                                    <button className='date-action-btn' title='날짜 변경' style={{marginLeft:'5px', padding:'5px'}}>📅</button>
                                                }
                                            />
                                        )}
                                            </span>
                                            
                                            <span >{dayData.planDayContent}</span>
                                        </div>
                                        
                                    </div>
                                    <div className='date-actions'>
                                        <button
                                            className='date-action-btn'
                                            title='하루 당기기'
                                            onClick={() => pushPullDate("pull", planNo, dayData.planDayNo)}
                                        >
                                            ⬅️ 당기기
                                        </button>
                                        <button
                                            className='date-action-btn'
                                            title='하루 미루기'
                                            onClick={() => pushPullDate("push", planNo, dayData.planDayNo)}
                                        >
                                            미루기 ➡️
                                        </button>
                                    </div>
                                </div>

                                <ul className='plan-date-tasks'>
                                    {dayData.tasks.map((task, detailIndex) => (
                                        <li
                                            key={task.id}
                                            className={`task-item ${task.status === "FINISHED" ? "completed" : ""}`}
                                        >
                                            <div className='task-checkbox'>
                                                <input
                                                    type='checkbox'
                                                    checked={task.status === "FINISHED"}
                                                    onChange={() => toggleTaskStatus(task.id, dayData.planDayNo, detailIndex)}
                                                />
                                            </div>

                                            <div className='task-content'>
                                                {editingTaskId === task.id ? (
                                                    <input
                                                        type='text'
                                                        className='task-edit-input'
                                                        value={editingText}
                                                        onChange={(e) => setEditingText(e.target.value)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className='task-text'>{task.task}</span>
                                                )}
                                            </div>
                                            {task.status === "FINISHED" && <span className="status-label">완료</span>}

                                            <div className='plan-date-task-actions'>
                                                {editingTaskId === task.id ? (
                                                    <>
                                                        <button
                                                            className='action-btn save-btn'
                                                            onClick={() => handlesaveEdit(task.id, dayData.planDayNo, detailIndex)}
                                                            title='저장'
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            className='action-btn cancel-btn'
                                                            onClick={() => setEditingTaskId(null)}
                                                            title='취소'
                                                        >
                                                            ✕
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className='action-btn edit-btn'
                                                            onClick={() => startEditingTask(task.id, task.task)}
                                                            title='수정'
                                                        >

                                                            <Pencil size={'1rem'} />
                                                        </button>

                                                        <button
                                                            className='action-btn delete-btn'
                                                            onClick={() => handleDeleteTask(dayData.planDayNo, detailIndex)}
                                                            title='삭제'
                                                        >

                                                            <Trash2 size={'1rem'} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default PlanListView