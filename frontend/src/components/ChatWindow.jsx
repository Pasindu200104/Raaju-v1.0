import MessageBubble from './MessageBubble';

export default function ChatWindow({ messages, messagesEndRef }) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
