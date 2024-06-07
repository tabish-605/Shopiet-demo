import React, { useState, useEffect, useContext } from 'react';
import AuthContext from './context/AuthContext';
import { useParams } from 'react-router-dom';

const Chat = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [prevMessages, setPrevMessages] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [error, setError] = useState(null);
    const { recipient } = useParams();
    const [isLoading, setIsLoading] = useState(true);

    const roomName = [user.username, recipient].sort().join('_');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/${roomName}`);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const jsonData = await response.json();
                setPrevMessages(jsonData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error fetching previous messages');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [roomName]);

    useEffect(() => {
        if (!isLoading && prevMessages !== null) {
            initializeSocket();
        }
    }, [isLoading, prevMessages]);

    const initializeSocket = () => {
        const wsURL = `${import.meta.env.VITE_API_URL.replace('http', 'ws')}/ws/socket-server/${roomName}/`;
        console.log("Connecting to WebSocket at:", wsURL);
        const chatSocket = new WebSocket(wsURL);

        chatSocket.onopen = function (e) {
            console.log('WebSocket connection established');
            setConnectionStatus('Connected');
            setError(null);
        };

        chatSocket.onmessage = function (e) {
            const data = JSON.parse(e.data);
            if (data.type === 'chat_message') {
                setMessages(prevMessages => [...prevMessages, {
                    message: data.message,
                    sender: data.sender
                }]);
            }
        };

        chatSocket.onclose = function (e) {
            console.error('Chat socket closed unexpectedly', e);
            setConnectionStatus('Disconnected');
            setError('Chat socket closed unexpectedly');
            // Attempt to reconnect after a delay
            setTimeout(initializeSocket, 5000);
        };

        chatSocket.onerror = function (e) {
            console.error('WebSocket error:', e);
            setError('WebSocket error');
        };

        setSocket(chatSocket);
    };

    const sendMessage = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                'message': messageInput,
                'sender': user.username,
                'recipient': recipient
            }));
            setMessageInput('');
        } else {
            console.error('WebSocket is not open');
            setError('WebSocket is not open');
        }
    };

    return (
        <div>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                prevMessages && (
                    <div className="chat">
                        {prevMessages.map((message) => (
                            <div className="message" key={message.id}>
                                <b>{message.sender_username === user.username ? 'You' : message.sender_username}</b>: {message.content}
                            </div>
                        ))}
                    </div>
                )
            )}
            <div id="chat-log">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <b>{msg.sender === user.username ? 'You' : msg.sender}</b>: {msg.message}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
            <p>Status: {connectionStatus}</p>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        </div>
    );
};

export default Chat;
