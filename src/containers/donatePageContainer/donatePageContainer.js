import './donatePageContainer.css';

const DonateContainer = () => {
    return (
        <div className="donate-container">
            <h1>Support the Developers</h1>
            <p>
                Genre Browser for Spotify is a free, open-source app built by a small team of developers who want to make music discovery easier.
            </p>
            <p>
                If you enjoy using the app, please consider donating to help cover its running costs. We're not looking for profit, but every contribution helps keep the service available for you and other users.
            </p>
            <p>
                Even small donations make a big difference — just a few supporters each month are enough to keep the app running.
            </p>
            <h2>How to Donate</h2>
            <p>
                Donating is quick and easy — simply use the form below without leaving the app. Thank you for your support!
            </p>

            <iframe
                id='kofiframe'
                src='https://ko-fi.com/genrebrowser/?hidefeed=true&widget=true&embed=true&preview=true'
                style={{ border: 'none', width: '100%', padding: '0px', background: '#000000' }}
                height='712'
                title='genrebrowser'>
            </iframe>
        </div >
    );
};

export default DonateContainer;
