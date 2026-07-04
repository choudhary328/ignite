import React, { useState, useEffect, useContext, useCallback } from 'react';
import { RiSendPlane2Line, RiMessage2Line, RiUserFill } from 'react-icons/ri';
import { UserContext } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import './DiscussionHub.css';

const DiscussionHub = ({ eventId }) => {
    const toast = useToast();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    const fetchComments = useCallback(async () => {
        const token = localStorage.getItem('igniteUserToken') || sessionStorage.getItem('igniteUserToken');
        try {
            const response = await fetch(`http://localhost:5000/api/events/${eventId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setComments(data);
            }
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setIsFetching(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        const token = localStorage.getItem('igniteUserToken') || sessionStorage.getItem('igniteUserToken');
        try {
            const response = await fetch(`http://localhost:5000/api/events/${eventId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ text: newComment }),
            });

            if (response.ok) {
                setNewComment("");
                fetchComments();
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to post comment");
            }
        } catch (err) {
            toast.error("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="discussion-hub">
            <div className="discussion-header">
                <h3><RiMessage2Line /> Discussion Hub</h3>
                <span>{comments.length} comments</span>
            </div>

            <div className="comments-list">
                {isFetching ? (
                    <div className="discussion-loader">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="no-comments">No messages yet. Start the conversation!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="comment-item">
                            <div className="comment-avatar">
                                {comment.user?.imageUrl ? (
                                    <img src={comment.user.imageUrl} alt={comment.userName} />
                                ) : (
                                    <div className="avatar-placeholder"><RiUserFill /></div>
                                )}
                            </div>
                            <div className="comment-content">
                                <div className="comment-meta">
                                    <span className="comment-author">{comment.userName}</span>
                                    <span className="comment-time">
                                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="comment-text">{comment.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form className="comment-input-area" onSubmit={handlePostComment}>
                <input
                    type="text"
                    placeholder="Ask a question or share something..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !newComment.trim()}>
                    <RiSendPlane2Line />
                </button>
            </form>
        </div>
    );
};

export default DiscussionHub;
