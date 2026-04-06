import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatAPI } from '../services/api';
import nexusMemory from '../domain/ai/conversationMemory';

export default function ChatBot() {
    const initialGreeting = {
        id: 'init',
        text: "Hi! I'm Nexus, your AI PC building assistant. How can I help you today?",
        sender: 'bot',
    };

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([initialGreeting]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);
    const previousAuthStatus = useRef(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const userType = isAuthenticated ? 'registered' : 'guest';
        nexusMemory.init(userType, user?.id || user?.email || null);
        previousAuthStatus.current = isAuthenticated;

        const storedHistory = nexusMemory.getHistory();
        if (storedHistory.length > 0) {
            setMessages(storedHistory.map((entry, index) => ({
                id: `${entry.timestamp}-${index}`,
                text: entry.content,
                sender: entry.role === 'assistant' ? 'bot' : entry.role,
            })));
        } else if (nexusMemory.getHistory().length === 0) {
            nexusMemory.addMessage('assistant', initialGreeting.text);
        }
    }, [isAuthenticated, user?.id, user?.email]);

    useEffect(() => {
        if (previousAuthStatus.current && !isAuthenticated) {
            handleClearChat();
        }
        previousAuthStatus.current = isAuthenticated;
    }, [isAuthenticated]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen, isLoading]);

    const handleClearChat = () => {
        nexusMemory.clearMemory();
        setMessages([initialGreeting]);
        nexusMemory.addMessage('assistant', initialGreeting.text);
    };

    const extractBudget = (text) => {
        const match = text.replace(/,/g, '').match(/\$?\s*(\d{3,6})/);
        return match ? Number(match[1]) : null;
    };

    const detectUseCase = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) {
            return 'ai';
        }
        if (lower.includes('workstation') || lower.includes('engineering') || lower.includes('cad')) {
            return 'workstation';
        }
        if (lower.includes('creator') || lower.includes('editing') || lower.includes('render')) {
            return 'creator';
        }
        if (lower.includes('stream')) {
            return 'streaming';
        }
        return 'gaming';
    };

    const isBudgetHelpRequest = (text) => {
        const lower = text.toLowerCase();
        return /budget|allocation|breakdown|split|spend|cost distribution/.test(lower) || /\$\s*\d/.test(lower);
    };

    const formatAllocationResponse = (data, rawBudget, useCase) => {
        const allocations = data?.allocations || [];
        const header = `Here's a suggested allocation for a $${rawBudget} ${useCase} build:`;
        const lines = allocations.map((allocation) => {
            const percent = `${allocation.percent_range.min}-${allocation.percent_range.max}%`;
            const amount = `$${allocation.amount_range.min.toFixed(0)}-$${allocation.amount_range.max.toFixed(0)}`;
            return `- ${allocation.component}: ${percent} (${amount})`;
        });
        return [header, ...lines, data?.note || ''].filter(Boolean).join('\n');
    };

    const handleSendMessage = async (event) => {
        event.preventDefault();
        if (!inputText.trim()) return;

        const userText = inputText.trim();
        const userMessage = { id: Date.now(), text: userText, sender: 'user' };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        nexusMemory.addMessage('user', userText);

        try {
            if (isBudgetHelpRequest(userText) && userText.toLowerCase().includes('breakdown')) {
                const budgetValue = extractBudget(userText);
                const useCase = detectUseCase(userText);

                if (budgetValue) {
                    const allocation = await chatAPI.getBudgetAllocation(budgetValue, useCase);
                    const formattedResponse = formatAllocationResponse(allocation, budgetValue, useCase);
                    const botMessage = {
                        id: Date.now() + 1,
                        text: formattedResponse,
                        sender: 'bot',
                    };
                    setMessages((prev) => [...prev, botMessage]);
                    nexusMemory.addMessage('assistant', formattedResponse);
                    return;
                }
            }

            const response = await chatAPI.sendMessage(
                userText,
                user?.id ? `web-${user.id}` : 'web-session',
                nexusMemory.getHistory().slice(0, -1).map((entry) => ({
                    role: entry.role === 'assistant' ? 'assistant' : entry.role,
                    content: entry.content,
                }))
            );

            const botResponseText = response.response || "I'm having trouble connecting to my brain right now.";
            const botMessage = {
                id: Date.now() + 1,
                text: botResponseText,
                sender: 'bot',
                buildVariants: response.build_variants || [],
            };

            setMessages((prev) => [...prev, botMessage]);
            nexusMemory.addMessage('assistant', botResponseText);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm currently offline or having trouble processing that. Please try again later.",
                sender: 'bot',
            };
            setMessages((prev) => [...prev, errorMessage]);
            nexusMemory.addMessage('assistant', errorMessage.text);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, fontFamily: 'Inter, sans-serif' }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '30px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                    }}
                >
                    AI
                </button>
            )}

            {isOpen && (
                <div
                    style={{
                        width: '350px',
                        height: '500px',
                        background: 'rgba(20, 20, 30, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        marginBottom: '1rem',
                        animation: 'fadeIn 0.2s ease-out',
                    }}
                >
                    <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>AI</span>
                            <span style={{ fontWeight: 'bold', color: 'white' }}>Nexus AI</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                onClick={handleClearChat}
                                style={{ background: 'rgba(255, 255, 255, 0.2)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.6rem', borderRadius: '999px', transition: 'background 0.2s' }}
                                type="button"
                                title="Clear conversation history"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
                            >
                                X
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {messages.map((msg) => (
                            <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                                <div
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: msg.sender === 'user' ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                        borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                        wordWrap: 'break-word',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.4',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {msg.text}
                                    {msg.buildVariants?.length > 0 && (
                                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                                            {msg.buildVariants.map((variant) => (
                                                <details key={`${msg.id}-${variant.label}`} style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '10px', padding: '0.5rem 0.75rem' }}>
                                                    <summary style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', listStyle: 'none' }}>
                                                        <span style={{ fontWeight: 600 }}>{variant.label}</span>
                                                        <span style={{ opacity: 0.8 }}>${variant.total_price}</span>
                                                    </summary>
                                                    <ul style={{ margin: '0.5rem 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                                        {variant.components?.map((component, index) => (
                                                            <li key={`${variant.label}-${component.type}-${index}`} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                                                                <span style={{ fontWeight: 600 }}>{component.type}</span>
                                                                <span style={{ opacity: 0.85 }}>{component.name}</span>
                                                                <span style={{ opacity: 0.75 }}>${component.price}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </details>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.1)', padding: '0.8rem', borderRadius: '12px', borderBottomLeftRadius: '2px' }}>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0s' }}>.</span>
                                    <span style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }}>.</span>
                                    <span style={{ animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }}>.</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(event) => setInputText(event.target.value)}
                                placeholder="Ask about builds, parts..."
                                style={{
                                    flex: 1,
                                    padding: '0.8rem',
                                    borderRadius: '999px',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: inputText.trim() ? '#667eea' : 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: 'white',
                                    cursor: inputText.trim() ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'background 0.2s',
                                }}
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
