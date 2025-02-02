import React, { useState } from 'react';

const MentaAI: React.FC = () => {
    const [messages, setMessages] = useState<{ user: string, text: string }[]>([]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim()) {
            setMessages([...messages, { user: 'You', text: input }]);
            // Simulate AI response
            setTimeout(() => {
                setMessages(prevMessages => [...prevMessages, { user: 'MentaAI', text: 'This is a simulated response.' }]);
            }, 1000);
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