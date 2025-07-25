import { useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Context } from "..";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Calendar, ChevronDown, Download, Eye, MessageCircle, Reply, Send, ThumbsUp, User, X } from "lucide-react";
import "../css/BoardDetail.css";
import { Modal } from "./ApiModal";

const BoardDetail = () => {
  const user = useSelector((state) => state.member.info);
  const token = useSelector((state) => state.member.token);
  const { host } = useContext(Context);
  const [board, setBoard] = useState({});
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [apiPlan, setAPIPlan] = useState({});
  const { boardNo } = useParams();
  const [expandedPlan, setExpandedPlan] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState(new Set());
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchBoardDetail(boardNo);
  }, [boardNo]);
  useEffect(() => {
    fetchComment(boardNo);
  }, [boardNo]);

  const fetchBoardDetail = async (boardNo) => {
    try {
      const res = await axios.get(`${host}/board/detail?boardNo=${boardNo}`, {
        headers: { Authorization: token }
      });
      setBoard(res.data);
      const apiRes = await axios.get(`${host}/board/apiPlan?apiPlanNo=${res.data.apiPlan}`, {
        headers: { Authorization: token }
      });
      const parsed = JSON.parse(apiRes.data.apiPlanContentList)
      setAPIPlan({ ...apiRes.data, apiPlanContentList: parsed });
    } catch (err) { console.error('실패', err); }
  }

  const fetchComment = async (boardNo) => {
    try {
      const res = await axios.get(`${host}/comment/get?boardNo=${boardNo}`, {
        headers: { Authorization: token }
      })
      setComments(res.data);
    } catch (err) { console.error('실패', err); }
  }

  const like = async () => {
    try {
      const res = await axios.post(`${host}/like/click`, JSON.stringify(boardNo),
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        })
      fetchBoardDetail(boardNo)
    } catch (err) { console.error('실패', err); }
  }

  const handleExpandedDetails = (detailNo) => {
    setExpandedDetails((before) => {
      const set = new Set(before);
      if (set.has(detailNo)) {
        set.delete(detailNo);
      } else {
        set.add(detailNo);
      }
      return set;
    })
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return

    const comment = {
      board: boardNo,
      commentContent: newComment,
      parentCommentNo: null
    }
    try {
      const res = await axios.post(`${host}/comment/register`, comment,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        })
      setNewComment("");
      fetchComment(boardNo);
    } catch (err) { console.log('실패', err) }
  }

  const handleReplySubmit = async (commentNo) => {
    if (!replyContent.trim()) return

    const reply = {
      board: boardNo,
      commentContent: replyContent,
      parentCommentNo: commentNo
    }

    try {
      const res = await axios.post(`${host}/comment/register`, reply,
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json'
          }
        })
      setReplyContent("");
      setReplyingTo(null);
      fetchComment(boardNo);
    } catch (err) { console.log('실패', err) }
  }

  const handleCommentDelete = async (commentNo) => {
    try {
      const res = await axios.post(`${host}/comment/delete`, JSON.stringify(commentNo),
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      }
    })
    fetchComment(boardNo);
    } catch (err) {console.log('실패', err)}
  }

  const handleBoardDelete = async () => {
    try {
      const res = await axios.post(`${host}/board/delete`, JSON.stringify(boardNo),
    {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      }
    })
    navigate("/board/main");
    } catch (err){console.log('실패',err)}
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderComments = (commentList, level = 0) => {
    return commentList.map((comment) => (
      <div key={comment.commentNo} className={`comment-item ${level > 0 ? `child level-${Math.min(level, 3)}` : ""}`}>
        <div className="comment-header">
          <div className="comment-author-info">
            <div>
              <div className="comment-author">{comment.deleteStatus ? "삭제된 사용자" : comment.userName}</div>
              <div className="comment-date">{formatDate(comment.commentTime)}</div>
            </div>
          </div>
          <div className="comment-actions">
            <button className="comment-action-btn" onClick={() => setReplyingTo(replyingTo === comment.commentNo ? null : comment.commentNo)}><Reply className="btn-icon" />댓글</button>
            {user.userName === comment.userName && !comment.deleteStatus && (
              <button className="comment-delete-btn" onClick={()=> {if(window.confirm("삭제하시겠습니까?")){handleCommentDelete(comment.commentNo)}}}>
                <X className="btn-icon" />삭제
              </button>
            )}
          </div>
        </div>

        {comment.deleteStatus ? (
          <div className="comment-deleted">삭제된 댓글입니다.</div>
        ) : (
          <div className="comment-content">{comment.commentContent}</div>
        )}

        {replyingTo === comment.commentNo && (
          <div className="comment-reply-form">
            <textarea className="comment-reply-textarea" placeholder="답글을 입력하세요" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} />
            <div className="comment-reply-actions">
              <button className="btn btn-secondary btn-small" onClick={() => setReplyingTo(null)}>취소</button>
              <button className="btn btn-primary btn-small" onClick={() => handleReplySubmit(comment.commentNo)}>
                <Send className="btn-icon" />댓글 작성
              </button>
            </div>
          </div>
        )}

        {comment.childComments.length > 0 && (
          <div className="comment-replies">{renderComments(comment.childComments, level + 1)}</div>
        )}
      </div>
    ))
  }

  const totalComments = () => {
    const countComments = (commentsList) => {
      return commentsList.reduce((total, comment) => {
        return total + 1 + countComments(comment.childComments)
      }, 0)
    }
    return countComments(comments)
  }

  return (
    <div className="board-view-container">
      <div className="board-view-wrapper">
        <div className="board-view-header">
          <div className="board-view-title-container">
            <div className="board-view-icon">
              <Eye />
            </div>
            <h1 className="board-view-title">게시글 조회</h1>
          </div>
        </div>

        <div className="post-card">
          <div className="post-header">
            <h1 className="post-title">{board.boardName}</h1>
            <div className="post-meta">
              <div className="post-meta-item">
                <User />
                <span>{board.userName}</span>
              </div>
              <div className="post-meta-item">
                <Calendar />
                <span>{board.boardTime}</span>
              </div>
            </div>
          </div>

          <div className="post-content">
            {board.boardContent && board.boardContent.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="recommendation-section">
            <div key={apiPlan.apiPlanNo} className="card">
              <div className="card-header">
                <h3 className="card-title">{apiPlan.apiPlanContentList?.study}</h3>
                <button className="card-expand-btn" onClick={() => setExpandedPlan(!expandedPlan)}>
                  <ChevronDown className={`card-expand-icon ${expandedPlan ? "expanded" : ''}`} />
                </button>
              </div>
              {expandedPlan && (
                <div className="details">
                  <div className="details-list">
                    {apiPlan.apiPlanContentList?.list.map((item, index) => (
                      <div className="detail-item" key={index}>
                        <div className="detail-header" onClick={() => { handleExpandedDetails(index) }}>
                          <div className="detail-header-content">
                            <span className="detail-date">
                              {item.date}
                            </span>
                            <span>{item.content}</span>
                          </div>
                          <ChevronDown className={`detail-toggle ${expandedDetails.has(index) ? "expanded" : ""}`} />
                        </div>
                        {expandedDetails.has(index) && (
                          <div className="detail-content">
                            <div className="detail-description">
                              세부내용:
                            </div>
                            <ul className="detail-list">
                              {item.details.map((detail, i) => (
                                <li key={i}>{detail.detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button className="recommendation-btn" onClick={() => { like() }}>
              <ThumbsUp className="recommendation-icon" />
              <span className="recommendation-count">{board.likeCount}</span>
            </button>
            {/* !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */}
            <button className="download-btn" onClick={() => setOpenModal(true)}><Download className="download-icon"/>저장</button>
            {board?.userName===user?.userName&&(
            <button className="board-remove-btn"><X className="remove-icon" onClick={()=>{if(window.confirm("게시글을 삭제하시겠습니까?")){handleBoardDelete()}}}/>삭제</button>
            )}
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h2 className="comments-title">
              <MessageCircle className="btn-icon" />
              댓글
              <span className="comments-count">{totalComments()}</span>
            </h2>
          </div>

          <div className="comment-form">
            <textarea className="comment-textarea" placeholder="댓글을 입력하세요" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
            <div className="comment-form-actions">
              <button className="btn btn-primary" onClick={() => (handleCommentSubmit())} disabled={!newComment.trim()}>
                <Send className="btn-icon" />댓글 작성
              </button>
            </div>
          </div>

          <div className="comments-list">
            {comments.length > 0 ? (
              renderComments(comments)
            ) : (
              <div className="comments-empty">
                <MessageCircle className="comments-empty-icon" />
                <p>첫 번째 댓글을 작성해보세요</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {openModal && (
        <Modal
          openModal={openModal}
          setOpenModal={setOpenModal}
          sharedPlan={apiPlan.apiPlanContentList}
          />
      )}
    </div>
  )
}

export default BoardDetail;