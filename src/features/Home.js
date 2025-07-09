import React, { useContext, useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import "../css/Home.css";
import axios from "axios";
import { Context } from '../index';
import { CalendarIcon, CheckSquare, Plus, Trash2 } from 'lucide-react';

const Home = () => {


  const [events, setEvents] = useState([]);

  const {host} = useContext(Context)

  const userNo = 1;

  useEffect(() => {
    const apicall = async () => {
      const response = await axios.get(`${host}/list?no=${userNo}`);
      if(response.status === 200) {
        const eventsData = response.data.map(planDay => ({
          id:planDay.planDayNo,
          title:planDay.planDayContent,
          start: planDay.planDayDate,
          end: planDay.planDayDate,
        }));
        setEvents(eventsData);
      } else {
        throw new Error(`api error: ${response.status} ${response.statusText}`);
      }  
    }
    
    apicall();
  },[]);

   const handleEventClick = (info) => {
     alert(`이벤트 제목: ${info.event.title}`);
   };
    

  return (
    <>
      <div id="home-title">
        <h2>나의 플래너</h2>
      </div>

      <div id="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          timeZone="Asia/Seoul"
          height="auto"
          headerToolbar={{
            start: "prev next",
            center: "title",
            end: "dayGridMonth dayGridWeek",
          }}
          views={{
            dayGridMonth:{
              dayMaxEventRows: 3, // 하루에 최대 3개의 이벤트 행 표시 (초과되는 건 +more 로 표시됨)
            },
            dayGridWeek: {
              titleFormat: { year: 'numeric', month: 'long' },
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
          
        />

        
        
      </div>
    </>
  );
}

export default Home