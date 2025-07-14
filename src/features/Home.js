import React, { useContext, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import "../css/Home.css";
import axios from "axios";
import { Context } from '../index';
import { useDispatch, useSelector } from 'react-redux';
import { clearEvents, setEvents } from '../store/eventSlice';

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

  const completedTasks = todayTasks.filter((task) => task.status).length
  const remainingTasks = todayTasks.length - completedTasks

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"

  })

  const addTask = async () => {
    if (newTask.trim() !== "") {
      const newTaskItem = {
        task: newTask.trim(),
        status: false,
      }


      try {
        const response = await axios.post(`${host}/task`, newTaskItem, {
          headers: { Authorization: token }
        });
        const savedTask = response.data;
        setTodayTasks([...todayTasks, savedTask])
        setNewTask("")
      } catch (err) {
        console.log("실패", err);
      }
    }
  }

  const toggleTaskStatus = async (taskId) => {
    const task = todayTasks.find(t => t.id === taskId);
    if(!task) return;

    const updateStatus = !task.status;
    try {
      await axios.post(`{host}/modify`, {
        planDayNo: taskId,  
        status: updateStatus
      },{
        headers: {Authorization: token}
      });
    
    setTodayTasks((tasks) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: updateStatus } : task
      )
    );
  } catch(error) {
    console.log("실패", error);
  }
};

  const deleteTask = (taskId) => {
    setTodayTasks((tasks) => tasks.filter((task) => task.id !== taskId));
  };

  const startEditing = (taskId, currentText) => {
    setEditingTaskId(taskId);
    setEditingText(currentText);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText("");
  };

  const saveEdit = async (taskId) => {
    if (editingText.trim() !== "") {
      try {
        const updatedTask = {
          task: editingText.trim(),
        };
        await axios.post(`${host}/modify`, updatedTask, {
          headers: { Authorization: token }
        });

        setTodayTasks((tasks) =>
          tasks.map((task) =>
            task.id === taskId ? { ...task, task: editingText.trim() } : task
          )
        );
        setEditingTaskId(null);
        setEditingText("");
      } catch (err) {
        console.log("수정 실패", err);
      }
    }

  };


  const userNo = user?.userNo;

  useEffect(() => {
    console.log(userNo);
    if (!userNo) {
      // setEvents([]);
      dispatch(clearEvents());
      setTodayTasks([]);
      return;
    }
    const apicall = async () => {
      const response = await axios.get(`${host}/list?no=${userNo}`, {
        headers: {
          Authorization: token
        }
      })
      if (response.status === 200) {
        const eventsData = response.data.map(planDay => ({
          id: planDay.planDayNo,
          title: planDay.planDayContent,
          contents: planDay.details.map(d => d.detail),
          start: planDay.planDayDate,
          end: planDay.planDayDate,
          rawDetails: planDay.details,
        }));
        // setEvents(eventsData);
        dispatch(setEvents(eventsData));
        const todayStr = new Date().toISOString().split('T')[0];

        const todayPlanDay = response.data.find(pd => pd.planDayDate === todayStr);

        if (todayPlanDay) {
          const newTodayTasks = todayPlanDay.details.map((detail, index) => ({
            id: index,
            task: detail.detail,
            status: detail.detailStatus === "FINISHED"
          }));
          setTodayTasks(newTodayTasks);
        } else {
          setTodayTasks([]);
        }
      } else {
        throw new Error(`api error: ${response.status} ${response.statusText}`);
      }
    }

    apicall();
  }, [userNo, host, dispatch, token]);

  const handleEventClick = (info) => {
    alert(`이벤트 제목: ${info.event.title}`);
  };


  return (
    <>
      <div className="home-title">
        <h2>나의 플래너</h2>
        {user !== null && `${user.userName}`}
      </div>
      <div className='main-container'>
        <div id="calendar-container">
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
                buttonText: "3일 보기",
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
        {/* 오늘 할일 섹션 */}
        <div className="today-tasks-section">
          <div className="tasks-header">
            <h3>오늘 할일</h3>
            <p className="today-date">{today}</p>
          </div>

          <div className="tasks-stats">
            <div className="stat-item">
              <span className="stat-number">{completedTasks}</span>
              <span className="stat-label">완료</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{remainingTasks}</span>
              <span className="stat-label">남은 일</span>
            </div>
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
                  addTask()
                }
              }}
            />
            <button className="add-btn" onClick={addTask}>
              +
            </button>
          </div>

          <div className="tasks-list">
            {todayTasks.map((task) => (
              <div key={task.id} className={`task-item ${task.status ? "completed" : ""}`}>
                <div className="task-checkbox">
                  <input type="checkbox" checked={task.status} onChange={() => toggleTaskStatus(task.id)} />
                  <span className="checkmark"></span>
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
                    <span className='task-text'>{task.task}</span>
                  )}

                  <div className={`task-status status-${task.status}`}></div>
                </div>

                <div>
                  {editingTaskId === task.id ? (
                    <>
                      <button className='save-btn' onClick={() => saveEdit(task.id)} title="저장">
                        ✓
                      </button>
                      <button className='cancle-btn' onClick={cancelEditing} title="취소">
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button className='edit-btn' onClick={() => startEditing(task.id, task.task)} title='수정'>
                        ✏️
                      </button>
                      <button className='delete-btn' onClick={() => deleteTask(task.id)} title="삭제">
                        ×
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {todayTasks.length === 0 && (
              <div className="empty-tasks">
                <p>오늘 할일이 없습니다.</p>
                <p>새로운 할일을 추가해보세요!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Home