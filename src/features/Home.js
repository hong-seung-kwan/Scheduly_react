import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import "../css/Home.css";

const Home = () => {




  return (
    <>
      <div>
        <h2>나의 플래너</h2>
      </div>

      <div id="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="auto"
          headerToolbar={{
            start: "prev next",
            center: "title",
            end: "dayGridMonth dayGridWeek",
          }}
          views={{
            dayGridWeek: {
              titleFormat: { year: 'numeric', month: 'long' }

            }
          }}
          locale={'ko'}
          dayHeaderFormat={{ weekday: 'short' }}
          dayCellContent={({ date }) => {
            return date.getDate();
          }}
          events={[

          ]}
        />
      </div>
    </>
  );
}

export default Home