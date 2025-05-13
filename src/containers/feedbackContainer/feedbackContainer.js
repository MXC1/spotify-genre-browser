import React, { useState } from 'react';
import './feedbackContainer.css';
import { v4 as uuidv4 } from 'uuid';

const FeedbackContainer = () => {
    const [feedback, setFeedback] = useState('');

    const handleInputChange = (event) => {
        setFeedback(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        submitFeedback(feedback);
        setFeedback('');
    };

    const submitFeedback = async (feedbackText) => {
        const response = await fetch(`https://obhjtma0z8.execute-api.eu-west-2.amazonaws.com/${process.env.REACT_APP_ENV}/feedback`, {
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
        if (data.success) {
            console.log('Feedback submitted');
        } else {
            console.error('Error submitting feedback');
        }
    };

    return (
        <div className="feedback-container">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter your feedback"
                    value={feedback}
                    onChange={handleInputChange}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default FeedbackContainer;
