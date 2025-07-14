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
  const [todayTasks, setTodayTasks] = useState([
    
  ])

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

        if(todayPlanDay) {
          const newTodayTasks = todayPlanDay.details.map((detail, index) => ({
            id: index,
            task: detail.detail,
            status: detail.detailStatus
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
                duration: {days :3},
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
            <p className="today-date"></p>
          </div>

          <div className="tasks-stats">
            <div className="stat-item">
              <span className="stat-number"></span>
              <span className="stat-label">완료</span>
            </div>
            <div className="stat-item">
              <span className="stat-number"></span>
              <span className="stat-label">남은 일</span>
            </div>
          </div>

          <div className="add-task-section">
            <input
              type="text"
              className="task-input"
              placeholder="새로운 할일을 입력하세요"
            />
            <button className="add-btn">
              +
            </button>
          </div>

          <div className="tasks-list">
            {todayTasks.map((task) => (
              <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                <div className="task-checkbox">
                  <input type="checkbox" checked={task.status} readOnly />
                  <span className="checkmark"></span>
                </div>
                <div className="task-content">
                  <span className="task-text">{task.task}</span>
                  <div className={`task-status status-${task.status}`}></div>
                </div>
                <button className="delete-btn">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home