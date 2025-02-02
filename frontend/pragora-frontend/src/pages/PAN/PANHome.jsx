import React, { useState } from 'react';
import { AcceptRequestButton, IgnoreRequestButton, MakeRequestButton, SendMessageButton } from '../../components/buttons/NetworkButtons';
/*import '../styles/components/NetworkButtons.css'; */
import '../../styles/pages/PANHome.css';

const PANHomePage = () => {
    const [connections, setConnections] = useState([
        { id: 1, name: "Adam Smith", designation: "Software Engineer", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 2, name: "Clara Martin", designation: "Product Manager", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 3, name: "Edward James", designation: "UX Designer", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    ]);

    const [connectionSuggestions, setConnectionSuggestions] = useState([
        { id: 4, name: "John Doe", designation: "Data Scientist", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 5, name: "Jane Roe", designation: "Marketing Specialist", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    ]);

    const [connectionRequests, setConnectionRequests] = useState([
        { id: 6, name: "Michael Scott", designation: "Regional Manager", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
        { id: 7, name: "Pam Beesly", designation: "Receptionist", bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    ]);

    const acceptRequest = (id) => {
        const acceptedRequest = connectionRequests.find((req) => req.id === id);
        setConnections([...connections, acceptedRequest]);
        setConnectionRequests(connectionRequests.filter((req) => req.id !== id));
    };

    const ignoreRequest = (id) => {
        setConnectionRequests(connectionRequests.filter((req) => req.id !== id));
    };

    const makeRequest = (id) => {
        console.log(`Friend request sent to user with ID: ${id}`);
    };

    return (
        <div className="pan-home-page">
            <header>
                <h1>PAN Home</h1>
            </header>

            <section className="connections">
                <h2>Friends</h2>
                <div className="connection-list">
                    {connections.map((connection) => (
                        <div key={connection.id} className="connection-card">
                            <h3>{connection.name}</h3>
                            <p>{connection.designation}</p>
                            <p>{connection.bio}</p>
                            <SendMessageButton onClick={() => console.log(`Message sent to ${connection.name}`)} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="suggestions">
                <h2>Suggestions</h2>
                <div className="suggestion-list">
                    {connectionSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="suggestion-card">
                            <h3>{suggestion.name}</h3>
                            <p>{suggestion.designation}</p>
                            <p>{suggestion.bio}</p>
                            <MakeRequestButton onClick={() => makeRequest(suggestion.id)} />
                        </div>
                    ))}
                </div>
            </section>

            <section className="requests">
                <h2>Friend Requests</h2>
                <div className="request-list">
                    {connectionRequests.map((request) => (
                        <div key={request.id} className="request-card">
                            <h3>{request.name}</h3>
                            <p>{request.designation}</p>
                            <p>{request.bio}</p>
                            <AcceptRequestButton onClick={() => acceptRequest(request.id)} />
                            <IgnoreRequestButton onClick={() => ignoreRequest(request.id)} />
                        </div>
                    ))}
                </div>
            </section>

        </div>
    );
};

export default PANHomePage;
