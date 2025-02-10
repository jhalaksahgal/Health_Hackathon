import React, { useState } from 'react';

const MentaAI: React.FC = () => {
    const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
    const [input, setInput] = useState('');
const handleSend = async () => {
    if (input.trim()) {
        setMessages([...messages, { user: 'You', text: input }]);

        try {
            const response = await fetch('http://localhost:8000/chat/chatWithBot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                patient_id: "67a932d0ca3e10e26a9d8c40", // Replace with actual patient ID
                user_message: input,
            }),
            });

            const data = await response.json();
            setTimeout(() => {
            setMessages((prevMessages) => [...prevMessages, { user: 'MentaAI', text: data.bot_response }]);
            }, 1000); // Delay of 1 second
        } catch (error) {
            console.error('Error:', error);
            setMessages((prevMessages) => [...prevMessages, { user: 'MentaAI', text: 'Error connecting to the server.' }]);
        }

        setInput('');
    }
};


    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
            <div className="flex-none p-4 bg-blue-500 text-white rounded-t-lg">
                <h2 className="text-xl font-bold">MentaAI Chat</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-white rounded-b-lg shadow-md">
                {messages.map((message, index) => (
                    <div key={index} className={`mb-2 p-2 rounded ${message.user === 'You' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'}`}>
                        <strong>{message.user}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <div className="flex-none mt-4">
                <div className="flex">
                    <input 
                        type="text" 
                        value={input} 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder="Type your message..." 
                        className="flex-1 p-2 border rounded-l-lg"
                    />
                    <button onClick={handleSend} className="p-2 bg-blue-500 text-white rounded-r-lg">Send</button>
                </div>
            </div>
        </div>
    );
};

export default MentaAI;