import React, { useContext, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import "../css/Home.css";
import axios from "axios";
import { Context } from '../index';
import { useDispatch, useSelector } from 'react-redux';
import { clearEvents, setEvents } from '../store/eventSlice';
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from 'lucide-react';
import { Modal } from './ApiModal';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Home = () => {

  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const events = useSelector((state) => state.events);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { host } = useContext(Context)
  const [todayTasks, setTodayTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [editingText, setEditingText] = useState("")
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectTitle, setSelectTitle] = useState("");
  const [selectDate, setSelectDate] = useState("");
  const [selectPlanDayNo, setSelectPlanDayNo] = useState(null);
  const [myPlan, setMyPlan] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [openModal, setOpenModal] = useState(false);




  const handleSaveSuccess = async () => {
    setReload(prev => !prev);
  };

  const handleEventClick = (info) => {
    const rawDetails = info.event.extendedProps.rawDetails;
    const planDayNo = info.event.id;
    const planDayContent = info.event.title;
    const planDayDate = info.event.startStr;

    setSelectPlanDayNo(planDayNo);
    setMyPlan(false);

    const taskList = rawDetails.map((detail, index) => ({
      id: `${planDayNo}-${index}`,
      planDayNo: planDayNo,
      task: detail.detail,
      status: detail.detailStatus === "FINISHED",
      detailIndex: index,
      date: planDayDate,
      title: planDayContent
    }));
    setSelectedTasks(taskList);
    setSelectTitle(planDayContent);
    setSelectDate(planDayDate);
  };
  // 추가
  const addTask = async () => {

    try {
      const newDetail = {
        planDayNo: selectPlanDayNo,
        content: newTask.trim()
      };
      const response = await axios.post(`${host}/addJson`, newDetail, {
        headers: {
          Authorization: token
        }
      });
      const save = response.data;

      console.log('addJson response:', save);

      const newTaskItem = {
        id: `${selectPlanDayNo}-${save.detailIndex}`,
        planDayNo: selectPlanDayNo,
        detailIndex: save.detailIndex,
        task: save.detail || newTask.trim(),
        status: save.detailStatus === "FINISHED"
      };
      const updatedTasks = [...selectedTasks, newTaskItem]
      setSelectedTasks(updatedTasks);
      setNewTask("");

      setReload(prev => !prev);
    } catch (err) {
      console.log("추가 실패", err);
    }
  };


  // 상태 변경
  const toggleTaskStatus = async (id, planDayNo, detailIndex) => {
    console.log("status 호출됨:", { id, planDayNo, detailIndex });

    const task = selectedTasks.find(t => t.id === id);
    if (!task) return;

    const updateStatus = !task.status;
    try {
      await axios.post(`${host}/jsonstatus`, {
        planDayNo,
        detailIndex,
      }, {
        headers: {
          Authorization: token
        }
      });

      setSelectedTasks((tasks) =>

        tasks.map((task) =>
          task.id === id ? { ...task, status: updateStatus } : task

        )
      );

      dispatch(setEvents(events.map(event => {
        if (event.id === planDayNo) {
          const updatedDetails = event.rawDetails.map((d, idx) => {
            if (idx === detailIndex) {
              return {
                ...d,
                detailStatus: updateStatus ? "FINISHED" : "BEFORE"
              };
            }
            return d;
          });
          return { ...event, rawDetails: updatedDetails };
        }
        return event;
      })))

      setReload(prev => !prev);

    } catch (error) {
      console.log("실패", error);
    }
  };


  // 삭제
  const deleteTask = async (taskId, planDayNo, detailIndex) => {

    try {
      await axios.post(`${host}/removeJson`, {
        planDayNo,
        detailIndex
      }, {
        headers: {
          Authorization: token
        }
      })
      const updatedTasks = selectedTasks.filter((task) => task.id !== taskId);
      setSelectedTasks(updatedTasks);
      if (updatedTasks.length === 0) {
        // setSelectTitle("");
        setSelectPlanDayNo(null);

      }
      setReload(prev => !prev);

    } catch (error) {
      console.log("삭제 실패: ", error);
    }
  };

  const startEditing = (taskId, currentText) => {
    setEditingTaskId(taskId);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  // 수정
  const saveEdit = async (id, planDayNo, detailIndex) => {
    console.log("saveEdit 호출됨:", { id, planDayNo, detailIndex, editingText });
    if (editingText.trim() !== "") {
      try {
        const updatedTask = {
          planDayNo,
          detailIndex,
          detail: editingText.trim(),
        };
        await axios.post(`${host}/jsonmodify`, updatedTask, {
          headers: {
            Authorization: token
          }
        });

        setSelectedTasks((tasks) =>
          tasks.map((task) =>
            task.id === id ? { ...task, task: editingText.trim() } : task
          )
        );
        setEditingTaskId(null);
        setEditingText("");

        setReload(prev => !prev);
      } catch (err) {
        console.log("수정 실패", err);
      }
    }

  };

  const moveTask = async (planDayNo, detailIndex, direction) => {
    console.log(`[순서 이동 요청] planDayNo: ${planDayNo}, detailIndex: ${detailIndex}, 방향: ${direction}`);

    try {
      await axios.post(`${host}/moveJson`, {
        planDayNo,
        detailIndex,
        move: direction
      }, {
        headers: {
          Authorization: token
        }
      });

      setSelectedTasks(prev => {
        const copied = [...prev];
        const idx = copied.findIndex(t => t.detailIndex === detailIndex);

        if (direction === 'up' && idx > 0) {
          [copied[idx], copied[idx - 1]] = [copied[idx - 1], copied[idx]];
        } else if (direction === 'down' && idx < copied.length - 1) {
          [copied[idx], copied[idx + 1]] = [copied[idx + 1], copied[idx]];
        }


        return copied.map((task, i) => ({
          ...task,
          detailIndex: i,
          id: `${task.planDayNo}-${i}`
        }));
      });
      setReload(prev => !prev);
    } catch (err) {
      console.log("이동 실패", err);
    }
  }

  const moveDate = async (info) => {
    const planDayNo = info.event.id;
    const newDate = info.event.start;

    const date = newDate.toISOString().split('T')[0];

    try {
      await axios.post(`${host}/moveDate`, {
        planDayNo,
        newDate: date
      }, {
        headers: {
          Authorization: token
        }
      });
      setReload(prev => !prev);
    } catch (error) {
      console.log("실패", error);
      info.revert();
    }
  }

  const handlemyPlan = async () => {
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

        setMyPlan(Plans);
      }
    } catch (error) {
      console.error("플랜 데이터 불러오기실패", error);
    }
  }

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
        setMyPlan((prevPlans) => prevPlans.filter(plan => plan.id !== planNo));
      }
    } catch (err) {
      console.error("플랜 삭제 실패", err);
    }
  }

  // 편집 시작
  const startEditingPlan = (planId) => {
    setMyPlan(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, editing: true, editName: plan.name }
          : plan
      )
    );
  };

  // 입력 변경
  const changePlanName = (planId, newName) => {
    setMyPlan(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, editName: newName }
          : plan
      )
    );
  };
  // 저장
  const savePlanName = async (planId) => {
    const plan = myPlan.find(p => p.id === planId);
    if (!plan) return;
    try {
      const response = await axios.post(`${host}/plan/modify`, {
        planNo: planId,
        planName: plan.editName,
      }, {
        headers: { Authorization: token }
      });
      if (response.status === 200) {
        setMyPlan(prev =>
          prev.map(p =>
            p.id === planId
              ? { ...p, name: plan.editName, editing: false, editName: "" }
              : p
          )
        );
        alert("플랜 이름이 수정되었습니다.");
      }
    } catch (error) {
      console.error("이름 수정 실패", error);
      alert("이름 수정에 실패했습니다.");
    }
  };
  const cancelEditingPlan = (planId) => {
    setMyPlan(prev =>
      prev.map(plan =>
        plan.id === planId
          ? { ...plan, editing: false, editName: "" }
          : plan
      )
    );
  };

  const userNo = user?.userNo;

  useEffect(() => {

    if (!userNo) {
      dispatch(clearEvents());
      setTodayTasks([]);
      return;
    }

    // 처음 로딩 시에만 초기화 실행
    if (isInitialLoad) {
      setMyPlan(false);
      setSelectTitle("");
      setSelectedTasks([]);
      setSelectPlanDayNo(null);
      setIsInitialLoad(false);
    }

    if (selectedTasks.length === 0 && todayTasks.length > 0 && !selectTitle) {
      setSelectedTasks(todayTasks);
    }

    const apicall = async () => {
      try {
        const response = await axios.get(`${host}/list?no=${userNo}`, {
          headers: {
            Authorization: token
          }
        });
        const colors = ['#76c3c577', '#c3767655', '#7676c377', '#E6CCFF', '#FFE5B4', '#B3DDF2', '#F5FFFA'];

        const colorMap = {};

        function getColorForPlanNo(planNo, date) {
          const key = `${planNo}-${date}`;
          if (!colorMap[key]) {
            const colorIndex = Object.keys(colorMap).length % colors.length;
            colorMap[key] = colors[colorIndex];
          }
          return colorMap[key];
        }

        if (response.status === 200) {
          const eventsData = response.data.map(planDay => ({
            id: planDay.planDayNo,
            title: planDay.planDayContent,
            contents: planDay.details.map(d => d.detail),
            start: planDay.planDayDate,
            end: planDay.planDayDate,
            rawDetails: planDay.details,
            status:planDay.status,
            backgroundColor: getColorForPlanNo(planDay.planNo)
          }));
          dispatch(setEvents(eventsData));

          const todayStr = new Date().toISOString().split('T')[0];
          const todayPlanDays = response.data.filter(pd => pd.planDayDate === todayStr);

          const newTodayTasks = [];
          todayPlanDays.forEach(planDay => {
            planDay.details.forEach((detail, index) => {
              newTodayTasks.push({
                planDayNo: planDay.planDayNo,
                id: `${planDay.planDayNo}-${index}`,
                task: detail.detail,
                status: detail.detailStatus === "FINISHED",
                detailIndex: index
              });
            });
          });
          setTodayTasks(newTodayTasks);
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (err) {
        console.error("API 호출 실패:", err);
        setTodayTasks([]);
      }
    };
    setCalendarEvents(events);
    apicall();

  }, [userNo, host, dispatch, token, reload]);



  return (
    <>
      <div className="home-title">
        
        <h2 style={{ marginTop: "10px" }}>{user !== null ? `${user.userName}의 플래너`: "로그인 후 이용하세요"}</h2>
      </div>
      <button className="my-schedule-btn" onClick={() => {
        setMyPlan(true);
        setSelectedTasks([]);
        setSelectTitle("");
        setSelectPlanDayNo(null);
        handlemyPlan();
      }}>
        📅 내 일정
      </button>
      <div className='main-container'>
        <div id="calendar-container" className={selectedTasks.length === 0 ? "full" : "shrink"}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            timeZone="Asia/Seoul"
            height="auto"
            headerToolbar={{
              start: "prev next",
              center: "title",
              end: "dayGridMonth threeDay",
            }}
            views={{
              dayGridMonth: {
                dayMaxEventRows: 3, // 하루에 최대 3개의 이벤트 행 표시 (초과되는 건 +more 로 표시됨)
              },
              dayGridWeek: {
                titleFormat: { year: 'numeric', month: 'long' },
                dayMaxEventRows: 3,
              },
              threeDay: {
                type: "dayGrid",
                duration: { days: 3 },
                buttonText: "3days",
                dayMaxEventRows: 3,
              }
            }}
            locale={'ko'}
            dayHeaderFormat={{ weekday: 'short' }} // week header부분 요일만 출력
            dayCellContent={({ date }) => {
              return date.getDate();
            }} // 7일 8일 => "일" 제거
            events={events}
            eventColor="#76c3c5" // 이벤트 기본 색상 설정
            eventTextColor="#089196" // 이벤트 텍스트 색상 설정
            eventBackgroundColor="#76c3c577" // 이벤트 배경 색상 설정
            eventBorderColor="#76c3c5" // 이벤트 테두리 색상 설정
            eventClick={handleEventClick} // 이벤트 클릭 시 콜백 함수 설정
            eventContent={(data) => {
              const title = data.event.title;
              const contents = data.event.extendedProps.contents;
              const status = data.event.extendedProps.status;
              return (
                <div className='fc-event-custom'>
                  <div className='fc-title'>{title}</div>
                  <div className='fc-contents'>
                    {status==="FINISHED" ? <div className='finished'><Check />완료됨</div> :
                    Array.isArray(contents) ? contents.map((line, i) => (
                      <div key={i}>{line}</div>
                    )) : <div>{contents}</div>}
                  </div>
                </div>
              );
            }}
            editable={true}
            eventDrop={moveDate}
          />
        </div>

        {/* 할일 리스트 - 이벤트를 클릭했을 때만 보이도록 */}
        {selectTitle && !myPlan && (
          <div className="today-tasks-section">
            <div className="tasks-header">
              <button className='close-btn' onClick={() => {
                setSelectedTasks([]);
                setSelectTitle("");
                setSelectPlanDayNo(null);
              }}>✖ 닫기</button>
              <h3>{selectTitle}</h3>
              {/* <p className="today-date">{selectDate}</p> */}
            </div>

            <div className="add-task-section">
              <input
                type="text"
                className="task-input"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="새로운 할일을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === "Enter"&&newTask!=="") {
                    addTask();
                  }
                }}
              />
              <button className="add-btn" onClick={newTask!=="" ? addTask: null}>+</button>
            </div>

            <div className="tasks-list">
              {selectedTasks.length > 0 ? (
                selectedTasks.map((task) => (
                  <div key={task.id}
                    className={`task-item ${task.status ? "completed" : ""}`}
                    onClick={() => toggleTaskStatus(task.id, task.planDayNo, task.detailIndex)}
                  >
                    {/* task control */}
                    <div className="task-control">
                      <ArrowUp
                        size={15}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTask(task.planDayNo, task.detailIndex, "up");
                        }}
                        className='task-arrow'
                      />
                      <ArrowDown
                        size={15}
                        onClick={(e) => {
                          e.stopPropagation();
                          moveTask(task.planDayNo, task.detailIndex, "down");
                        }}
                        className='task-arrow'
                      />
                    </div>

                    {/* task content */}
                    <div className="task-content">
                      {editingTaskId === task.id ? (
                        <input
                          type='text'
                          className='edit-input'
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span className='task-text'>{task.task}</span>
                      )}
                    </div>

                    {/* buttons */}
                    <div>
                      {editingTaskId === task.id ? (
                        <>
                          <button className='save-btn' onClick={(e) => {
                            e.stopPropagation();
                            const [planDayNo, detailIndexStr] = task.id.split('-');
                            const detailIndex = parseInt(detailIndexStr, 10);
                            saveEdit(task.id, planDayNo, detailIndex);
                          }}>✓</button>
                          <button className='cancle-btn' onClick={(e) => { e.stopPropagation(); cancelEditing() }}>✕</button>
                        </>
                      ) : (
                        <>
                          <button className='edit-btn' onClick={(e) => { e.stopPropagation(); startEditing(task.id, task.task) }}><Pencil /></button>
                          <button className='delete-btn' onClick={(e) => { e.stopPropagation(); deleteTask(task.id, task.planDayNo, task.detailIndex) }}><X /></button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-tasks">
                  <p>할일이 없습니다.</p>
                  <p>새로운 할일을 추가해보세요!</p>
                </div>
              )}
            </div>
          </div>
        )}
        {user && myPlan && !selectTitle && (
          <div className="today-tasks-section">
            <div className="tasks-header">
              <button className='close-btn' onClick={() => {
                setMyPlan(false);
              }}>✖ 닫기</button>
              <h3>내 일정</h3>
            </div>

            <div className="tasks-list">
              {myPlan.length > 0 ? (
                myPlan.map((plan) => (
                  <div key={plan.id} className="task-item">
                    <div className="task-content">
                      {plan.editing ? (
                        <input
                          className='edit-input'
                          type="text"
                          value={plan.editName}
                          onChange={(e) => {
                            // editName 상태 변경
                            setMyPlan(prev =>
                              prev.map(p =>
                                p.id === plan.id ? { ...p, editName: e.target.value } : p
                              )
                            );
                          }}
                        />
                      ) : (
                        <span
                          className='task-text'
                          onClick={() => {
                            console.log(plan);
                            navigate(`/plan/listview/${plan.id}`, {
                              state: { planName: plan.name }
                            });
                          }}
                          style={{ cursor: "pointer", textDecoration: "underline" }}
                        >
                          {plan.name}
                        </span>
                      )}
                    </div>

                    <div>
                      {plan.editing ? (
                        <>
                          <button
                            className='save-btn'
                            onClick={async () => {
                              try {
                                const response = await axios.post(`${host}/plan/modify`, {
                                  planNo: plan.id,
                                  planName: plan.editName,
                                }, {
                                  headers: { Authorization: token }
                                });
                                if (response.status === 200) {
                                  setMyPlan(prev =>
                                    prev.map(p =>
                                      p.id === plan.id
                                        ? { ...p, name: plan.editName, editing: false, editName: "" }
                                        : p
                                    )
                                  );
                                  alert("플랜 이름이 수정되었습니다.");
                                }
                              } catch (error) {
                                console.error("이름 수정 실패", error);
                                alert("이름 수정에 실패했습니다.");
                              }
                            }}
                          >
                            저장
                          </button>
                          <button
                            className='cancle-btn'
                            onClick={() => {
                              setMyPlan(prev =>
                                prev.map(p =>
                                  p.id === plan.id
                                    ? { ...p, editing: false, editName: "" }
                                    : p
                                )
                              );
                            }}
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className='edit-btn'
                            onClick={() => {
                              setMyPlan(prev =>
                                prev.map(p =>
                                  p.id === plan.id
                                    ? { ...p, editing: true, editName: plan.name }
                                    : p
                                )
                              );
                            }}
                          >
                            <Pencil />
                          </button>

                          <button
                            className='delete-btn'
                            onClick={() => removePlan(plan.id)}
                          >
                            <X />
                          </button>

                          <span
                          style={{
                            color:plan.Planstatus === "FINISHED" ? "red" : "#007bff",
                            fontSize:"14px",
                            marginLeft:"5px"
                          }}>
                            {plan.Planstatus === "FINISHED" ? "완료" : "진행"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-tasks">
                  <p>플랜이 없습니다.</p>
                </div>
              )}
            </div>



          </div>
        )}

      </div>
    </>
  )

}
export default Home
