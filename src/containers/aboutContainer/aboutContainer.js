const AboutContainer = () => {
    return (
        <div className="about-container">
            <h1>About Genre Browser for Spotify</h1>
            <p>
                Genre Browser for Spotify is a web application that helps you explore your saved albums on Spotify by grouping them into genres. 
                It provides an intuitive interface to navigate through your music library and discover patterns in your listening habits.
            </p>
            <h2>Features</h2>
            <ul>
                <li>View your saved albums categorized by genres.</li>
                <li>Search for specific genres, albums, or artists.</li>
                <li>Sort genres by name or the number of albums.</li>
                <li>Seamlessly integrate with Spotify for real-time updates.</li>
                <li>Disconnect your Spotify account at any time, ensuring your data is wiped locally.</li>
            </ul>
            <h2>Privacy</h2>
            <p>
                Your privacy is our priority. The app does not collect or store any personal data beyond what is necessary for its functionality. 
                All logs are anonymized and stored securely.
            </p>
            <h2>Get Started</h2>
            <p>
                To begin, log in with your Spotify account and start exploring your music library in a whole new way!
            </p>
        </div>
    );
};

export default AboutContainer;
