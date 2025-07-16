import React, { useContext, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import "../css/Home.css";
import axios from "axios";
import { Context } from '../index';
import { useDispatch, useSelector } from 'react-redux';
import { clearEvents, setEvents } from '../store/eventSlice';
import { ArrowDown, ArrowUp } from 'lucide-react';

const Home = () => {

  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  // const [events, setEvents] = useState([]);
  const events = useSelector((state) => state.events);
  const dispatch = useDispatch();
  const { host } = useContext(Context)
  const [todayTasks, setTodayTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [editingText, setEditingText] = useState("")
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [reload, setReload] = useState(false);

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"

  })
  const handleEventClick = (info) => {
    const rawDetails = info.event.extendedProps.rawDetails;
    const planDayNo = info.event.id;

    const taskList = rawDetails.map((detail, index) => ({
      id: `${planDayNo}-${index}`,
      planDayNo: planDayNo,
      task: detail.detail,
      status: detail.detailStatus === "FINISHED",
      detailIndex: index
    }));
    setSelectedTasks(taskList);
  };
  // 추가
  const addTask = async () => {
    const planDayNo = selectedTasks[0].planDayNo;

    try {
      const newDetail = {
        planDayNo: planDayNo,
        content: newTask.trim()
      };
      const response = await axios.post(`${host}/addJson`, newDetail, {
        headers: {
          Authorization: token
        }
      });
      const save = response.data;

      const newTaskItem = {
        id: `${planDayNo}-${save.detailIndex}`,
        planDayNo: planDayNo,
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
      setSelectedTasks((tasks) => tasks.filter((task) => task.id !== taskId));
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
      await axios.post(`${host}/moveJson`,{
        planDayNo,
        detailIndex,
        move:direction
      },{
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
    } catch(err) {
      console.log("이동 실패", err);
    }
  }

  const userNo = user?.userNo;

  useEffect(() => {

    if (!userNo) {
      dispatch(clearEvents());
      setTodayTasks([]);
      return;
    }
    if (selectedTasks.length === 0 && todayTasks.length > 0) {
      setSelectedTasks(todayTasks);
    }

    const apicall = async () => {
      try {
        const response = await axios.get(`${host}/list?no=${userNo}`, {
          headers: {
            Authorization: token
          }
        });
        const colors = ['#76c3c577', '#c3767655', '#7676c377'];
        const colorMap = {};

        function getColorForPlanNo(planNo) {
          if (!colorMap[planNo]) {
            const colorIndex = Object.keys(colorMap).length % colors.length;
            colorMap[planNo] = colors[colorIndex];
          }
          return colorMap[planNo];
        }
        if (response.status === 200) {
          const eventsData = response.data.map(planDay => ({
            id: planDay.planDayNo,
            title: planDay.planDayContent,
            contents: planDay.details.map(d => d.detail),
            start: planDay.planDayDate,
            end: planDay.planDayDate,
            rawDetails: planDay.details,
            backgroundColor: getColorForPlanNo(planDay.planNo)
          }));

          dispatch(setEvents(eventsData));

          const todayStr = new Date().toISOString().split('T')[0];


          const todayPlanDays = response.data.filter(pd => pd.planDayDate === todayStr);


          const newTodayTasks = [];

          todayPlanDays.forEach(planDay => {
            planDay.details.forEach((detail, index) => {
              newTodayTasks.push({
                planDayNo: planDay.planDayNo,                   // 어떤 planDay에 속한 detail인지
                id: `${planDay.planDayNo}-${index}`,            // 고유 ID
                task: detail.detail,
                status: detail.detailStatus === "FINISHED" ? true : false,
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

    apicall();
  }, [userNo, host, dispatch, token, reload]);



  return (
    <>
      <div className="home-title">
        <h2>나의 플래너</h2>
        {user !== null && `${user.userName}`}
      </div>
      <div className='main-container'>
        <div id="calendar-container" className={selectedTasks.length === 0 ? "full" : "shrink"}>
          <FullCalendar
            plugins={[dayGridPlugin]}
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
              return (
                <div className='fc-event-custom'>
                  <div className='fc-title'>{title}</div>
                  <div className='fc-contents'>
                    {Array.isArray(contents) ? contents.map((line, i) => (
                      <div key={i}>{line}</div>
                    )) : <div>{contents}</div>}
                  </div>
                </div>
              );
            }}
          />
        </div>
        
        {/* 할일 리스트 - 이벤트를 클릭했을 때만 보이도록 */}
        {selectedTasks.length > 0 && (
          <div className="today-tasks-section">
            <div className="tasks-header">
              <button className='close-btn' onClick={() => setSelectedTasks([])}>✖ 닫기</button>
              <h3>할일 리스트</h3>
              <p className="today-date">{today}</p>
            </div>

            <div className="add-task-section">
              <input
                type="text"
                className="task-input"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="새로운 할일을 입력하세요"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addTask();
                  }
                }}
              />
              <button className="add-btn" onClick={addTask}>+</button>
            </div>

            <div className="tasks-list">
              {selectedTasks.map((task) => (
                
                <div key={task.id} 
                className={`task-item ${task.status ? "completed" : ""}`}
                // onClick={() => toggleTaskStatus(task.id,task.planDayNo, task.detailIndex)}
                >
                  <div className="task-control">
                    <ArrowUp
                    size={15}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(task.planDayNo, task.detailIndex, "up")}}
                    className='task-arrow'
                    />
                    <ArrowDown
                    size={15}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveTask(task.planDayNo, task.detailIndex, "down")}}
                    className='task-arrow'
                    />
                  </div>

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
                      <span className='task-text' >{task.task}</span>
                    )}
                  </div>

                  <div>
                    {editingTaskId === task.id ? (
                      <>
                        <button className='save-btn' onClick={() => {
                          const [planDayNo, detailIndexStr] = task.id.split('-');
                          const detailIndex = parseInt(detailIndexStr, 10);
                          saveEdit(task.id, planDayNo, detailIndex);
                        }}>✓</button>
                        <button className='cancle-btn' onClick={cancelEditing}>✕</button>
                      </>
                    ) : (
                      <>
                        <button className='edit-btn' onClick={() => startEditing(task.id, task.task)}>✏️</button>
                        <button className='delete-btn' onClick={() => deleteTask(task.id, task.planDayNo, task.detailIndex)}>×</button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {selectedTasks.length === 0 && (
                <div className="empty-tasks">
                  <p>할일이 없습니다.</p>
                  <p>새로운 할일을 추가해보세요!</p>
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
