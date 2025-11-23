import { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Merhaba! Ben ÇiçekSepeti Asistanı 🌸 Size nasıl yardımcı olabilirim?", sender: "bot" }
  ]);
  
  // Mesaj geldikçe en aşağı kaydırmak için referans
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- BOTUN BEYNİ (Cevap Mantığı) ---
  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("merhaba") || lowerText.includes("selam")) 
      return "Merhaba! Hoş geldiniz. Size çiçekler hakkında bilgi verebilirim.";
    
    if (lowerText.includes("kargo") || lowerText.includes("teslimat") || lowerText.includes("ne zaman")) 
      return "Siparişleriniz genellikle aynı gün veya seçtiğiniz tarihte teslim edilir. 🚚";

    if (lowerText.includes("iade") || lowerText.includes("iptal")) 
      return "Siparişinizi 'Siparişlerim' sayfasından iptal edebilirsiniz. İade için müşteri hizmetlerini arayınız.";

    if (lowerText.includes("telefon") || lowerText.includes("iletişim")) 
      return "Bize 0850 123 45 67 numarasından ulaşabilirsiniz. 📞";

    if (lowerText.includes("fiyat") || lowerText.includes("pahalı")) 
      return "Fiyatlarımız piyasadaki en taze çiçeklere göre ayarlanmıştır. Kampanyalarımızı takip edin! 💸";

    if (lowerText.includes("adres") || lowerText.includes("yer")) 
      return "Merkezimiz Londra'dadır ancak tüm İngiltere'ye gönderim yapıyoruz. 🇬🇧";

    return "Bunu tam anlayamadım. 🤔 'Kargo', 'İletişim' veya 'İade' gibi kelimeler kullanabilir misiniz?";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Kullanıcı Mesajını Ekle
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // 2. Botun Düşünme Süresi (Yapay Gecikme)
    setTimeout(() => {
      const botReply = { text: getBotResponse(userMessage.text), sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  // Hazır Sorular (Chips)
  const handleQuickQuestion = (question) => {
    setInput(question);
    // Otomatik gönderim için biraz bekleme hilesi yapılabilir ama şimdilik inputa yazsın yeter.
    // Veya direkt handleSend mantığını burada çağırabiliriz:
    const userMessage = { text: question, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setTimeout(() => {
        setMessages((prev) => [...prev, { text: getBotResponse(question), sender: "bot" }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000] flex flex-col items-end">
      
      {/* --- CHAT PENCERESİ --- */}
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up mb-4">
          
          {/* Header */}
          <div className="bg-pink-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold">Canlı Destek</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-xl text-sm shadow-sm ${
                    msg.sender === "user" 
                      ? "bg-pink-600 text-white rounded-br-none" 
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Hazır Sorular (Chips) */}
          <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
            {["Kargo durumu?", "İade politikası", "Telefon numarası"].map((q, i) => (
                <button 
                    key={i} 
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs bg-white border border-pink-200 text-pink-600 px-3 py-1 rounded-full whitespace-nowrap hover:bg-pink-50 transition"
                >
                    {q}
                </button>
            ))}
          </div>

          {/* Input Alanı */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir şeyler yazın..." 
              className="flex-1 text-sm outline-none text-gray-700"
            />
            <button type="submit" className="text-pink-600 hover:text-pink-700 font-bold transform hover:scale-110 transition">
              ➤
            </button>
          </form>
        </div>
      )}

      {/* --- YUVARLAK BUTON (FAB) --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105 hover:rotate-12"
      >
        {isOpen ? (
          <span className="text-2xl font-bold">✕</span>
        ) : (
          <span className="text-3xl">💬</span>
        )}
      </button>

    </div>
  );
};

export default Chatbot;