import './privacyPolicyContainer.css';

const PrivacyPolicyContainer = () => {
    return (
        <div className="privacy-policy-container">
            <h2>1. Core Functionality</h2>
            <p>This service integrates with Spotify to provide its core functionality. It does not collect, store, or share any user data beyond what is necessary for the integration to function.</p>

            <h2>2. Data Collection</h2>
            <p>No user data is collected or stored by this service.</p>

            <h2>3. Logging</h2>
            <p>The service logs messages to AWS CloudWatch for debugging and monitoring purposes. All logged data is anonymized, using only a randomly generated session ID for correlation. No personally identifiable information is stored.</p>

            <h2>4. Third-Party Involvement</h2>
            <p>No third parties are involved in the operation of this service. All data handling is done within the service's own infrastructure.</p>

            <h2>5. Disconnecting the Service</h2>
            <p>Users have the option to disconnect the service from Spotify. When this is done, all local data is wiped. Logs stored in AWS CloudWatch will not be deleted, as they are fully anonymized and do not contain personal information.</p>

            <h2>6. Additional Considerations</h2>
            <p>There are no additional privacy concerns beyond what has been stated above.</p>

            <h2>7. Hosting</h2>
            <p>This service is hosted on Amazon Web Services (AWS). No data ever leaves the AWS region where it is hosted.</p>
        </div>
    );
};

export default PrivacyPolicyContainer;