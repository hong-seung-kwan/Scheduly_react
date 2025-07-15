import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { Context } from '..';
import { useSelector } from 'react-redux';
import { Calendar, ChevronLeft, ChevronRight, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { formatDate } from '@fullcalendar/core/index.js';
import "../css/Board.css";

const Board = () => {
  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  const { host } = useContext(Context);
  const [board, setBoard] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  useEffect(() => {
    fetchBoard(page);
  }, [page]);


  const fetchBoard = async (pageNumber) => {
    try {
      const res = await axios.get(`${host}/board/main?page=${pageNumber}`,
        {
          headers: { Authorization: token }
        });
      setBoard(res.data.list);
      setTotalPage(res.data.totalPage);
    } catch (err) {
      console.error('실패', err);
    }
  };

  return (
    <div className='board-container'>
      <div className='board-wrapper'>
        <div className='board-header'>
          <div className='board-title-container'>
            <div className='board-icon'>
              <MessageSquare></MessageSquare>
            </div>
            <h1 className='board-title'>게시판</h1>
          </div>
          <p className='board-description'>플랜 업로드</p>
        </div>

        <div className='board-card'>
          <div className='board-card-header'>
            <h2 className='board-card-title'>전체 게시글</h2>
          </div>
          <div className="board-card-content">
              <div className='board-items'>
                {board.map((board) => (
                  <div key={board.boardNo} className='board-item'>
                    <div className='board-item-content'>
                      <div className='board-item-main'>
                        <h3 className='board-item-title'>{board.boardName}</h3>
                        <div className='board-item-meta'>
                          <div className='board-item-meta-item'>
                            <Calendar />
                            <span>{formatDate(board.boardTime)}</span>
                          </div>
                          <div className='board-item-meta-item'>
                            <ThumbsUp />
                            <span>좋아요 {board.likeCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className='board-badge'>
                        {board.likeCount > 10 ? "인기" : "일반"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </div>
        {totalPage > 1 && (
          <div className='pagination-container'>
            <button className='pagination-button' onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
              <ChevronLeft />
            </button>
            <div className='pagination-numbers'>
              {[Array(totalPage)].map((_, i) => (
                <button key={i} className={`pagination-button ${page === 1 ? "active" : ""}`} onClick={() => setPage(i)}>{i + 1}</button>
              ))}
            </div>
            <button
              className="pagination-button"
              onClick={() => setPage(Math.min(totalPage - 1, page + 1))}
              disabled={page === totalPage - 1}
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Board;
