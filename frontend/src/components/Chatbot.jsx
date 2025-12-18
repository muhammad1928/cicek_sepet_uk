import { useState, useRef, useEffect } from "react";
// i18n importunu tutuyoruz ama bu dosya özelinde hardcoded İngilizce kullanıyoruz.
// İleride 't' fonksiyonu ile tekrar çok dilli yapabilirsin.

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  
  // Başlangıç mesajı (İngilizce)
  const [messages, setMessages] = useState([
    { text: "Hello! 👋 Welcome to our support. How can I help you today?", sender: "bot" }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // --- YENİLENMİŞ İNGİLİZCE AKILLI CEVAP SİSTEMİ ---
  const getBotResponse = (text) => {
    const lower = text.toLowerCase();

    // 1. Greeting / Selamlaşma
    if (lower.match(/(hello|hi|hey|good morning|good evening|greetings)/)) 
      return "Hello there! 🌸 Looking for a perfect gift or need help with an order?";

    // 2. Order Tracking / Kargo Nerede?
    if (lower.match(/(where|track|order|shipping|delivery|arrive)/)) 
      return "📦 **Order Tracking:**\nYou can track your order status in real-time from the 'My Orders' page. We will also send you an SMS when the courier is on the way.";

    // 3. Flower Care / Bakım (Ürün Bazlı Soru Türetme)
    if (lower.match(/(care|water|die|wither|fade|sun|life)/)) 
      return "🌿 **Plant & Flower Care Tips:**\n1. Change the water every 2 days.\n2. Cut the stems diagonally (45° angle).\n3. Keep away from direct sunlight and drafts.\n4. For Orchids: Submerge in water once a week.";

    // 4. Refunds & Damaged Goods / İade ve Hasarlı Ürün
    if (lower.match(/(refund|return|broken|damaged|bad|quality|problem)/)) 
      return "We are sorry to hear that! 😔\nIf your product arrived damaged, please go to 'My Orders' -> 'Order Details' and click 'Create Request'. Or email us a photo at support@yoursite.com.";

    // 5. Gift Note & Anonymous / Not ve İsim Gizleme (Özel Senaryo)
    if (lower.match(/(note|card|message|anonymous|secret|name)/)) 
      return "📝 **Gift Notes:**\nYes! You can add a personal card message during checkout. If you want to send it anonymously, simply uncheck the 'Show my name' box at the payment step.";

    // 6. Payment Methods / Ödeme
    if (lower.match(/(pay|credit|card|wallet|installment)/)) 
      return "💳 **Payments:**\nWe accept Visa, Mastercard, and Amex. You can also pay via digital wallets depending on your region.";

    // 7. Human Support / Canlı Destek
    if (lower.match(/(human|agent|person|live|support|talk)/)) 
      return "Connecting you to a representative... ⏳\n(All agents are currently busy. Please leave your email or call us at +44 850 123 45 67)";

    // Default / Anlaşılamadı
    return "I didn't quite catch that. 🤔\nYou can ask things like:\n- 'Where is my order?'\n- 'How to care for roses?'\n- 'Can I send anonymously?'";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Botun "yazıyor..." hissi vermesi için biraz daha uzun gecikme eklenebilir
    setTimeout(() => {
      const botReply = { text: getBotResponse(userMessage.text), sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
    }, 700);
  };

  const handleQuickQuestion = (question) => {
    // Hazır soruları butona basınca input gibi işletiyoruz
    const userMessage = { text: question, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    
    setTimeout(() => {
        setMessages((prev) => [...prev, { text: getBotResponse(question), sender: "bot" }]);
    }, 700);
  };

  return (
    <div className="fixed bottom-5 left-5 z-[1000] flex flex-col items-start font-sans">
      
      {isOpen && (
        <div className="bg-white 
          w-[calc(100vw-2.5rem)] h-[60vh]
          sm:w-80 sm:h-96
          md:w-96 md:h-[30rem]
          lg:w-[28rem] lg:h-[38rem]
          rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up mb-4 transition-all duration-300 ease-in-out">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">Customer Support</span>
                <span className="text-[10px] text-white/80">Typically replies instantly</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-bold text-lg">✕</button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm whitespace-pre-line 
                  ${msg.sender === "user" 
                    ? "bg-purple-600 text-white rounded-br-none" 
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Hazır Sorular (Quick Chips) - İngilizce */}
          <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar pb-3">
            {[
              "Where is my order? 📦", 
              "Flower Care 🌿", 
              "Broken Item 💔", 
              "Anonymous Gift 🕵️"
            ].map((q, i) => (
                <button key={i} onClick={() => handleQuickQuestion(q)} 
                  className="text-xs bg-white border border-purple-200 text-purple-600 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-purple-50 transition shadow-sm">
                  {q}
                </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Type your message..." 
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400" 
            />
            <button type="submit" className="text-purple-600 hover:text-purple-700 font-bold transform hover:scale-110 transition p-1">
              {/* Send Icon SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Ana Buton */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-110 hover:shadow-purple-500/50 z-50"
      >
        {isOpen ? (
            <span className="text-2xl font-bold">✕</span> 
        ) : (
            // Chat Icon SVG
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.159 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
        )}
      </button>

    </div>
  );
};

export default Chatbot;