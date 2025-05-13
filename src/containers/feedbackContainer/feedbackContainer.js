import React, { useState } from 'react';
import './feedbackContainer.css';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../utilities/logger';

const FeedbackContainer = () => {
    const [feedback, setFeedback] = useState('');
    const [status, setStatus] = useState('idle'); // idle | submitting | success | error

    const handleInputChange = (event) => {
        setFeedback(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!feedback.trim()) return;
        setStatus('submitting');
        try {
            await submitFeedback(feedback);
            setStatus('success');
            setFeedback('');
        } catch (e) {
            setStatus('error');
        }
    };

    const submitFeedback = async (feedbackText) => {
        logger.debug('FEED001', 'Submitting feedback', { feedbackEndpoint: process.env.REACT_APP_FEEDBACK_ENDPOINT });
        const response = await fetch(process.env.REACT_APP_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: uuidv4(),
                message: feedbackText,
            }),
        });
        const data = await response.json();
        if (!data.success) {
            throw new Error('Error submitting feedback');
        }
    };

    return (
        <div className="feedback-container">
            <h3>We'd love to hear your thoughts</h3>
            <p className="feedback-description">
                As a beta tester, your input is especially valuable. Use the form below to report bugs, suggest features, or share any thoughts you have. <br/>
                The more feedback we get, the better we can make the app.
            </p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="feedback-textarea" className="visually-hidden">Feedback</label>
                <textarea
                    id="feedback-textarea"
                    placeholder="Enter your feedback"
                    value={feedback}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    disabled={status === 'submitting'}
                />
                <button
                    type="submit"
                    disabled={status === 'submitting' || !feedback.trim()}
                >
                    {status === 'submitting' ? 'Submitting...' : 'Submit'}
                </button>
                {status === 'success' && (
                    <div className="feedback-success">Thank you for your feedback!</div>
                )}
                {status === 'error' && (
                    <div className="feedback-error">Error submitting feedback. Please try again.</div>
                )}
            </form>
        </div>
    );
};

export default FeedbackContainer;
