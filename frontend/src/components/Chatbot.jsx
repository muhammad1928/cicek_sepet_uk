import { useState, useRef, useEffect } from "react";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Merhaba! Ben ÇiçekSepeti Asistanı 🌸 Size nasıl yardımcı olabilirim?", sender: "bot" }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const getBotResponse = (text) => {
    const lower = text.toLowerCase();

    // 1. SELAMLAŞMA
    if (lower.match(/(merhaba|selam|hey|günaydın|iyi akşamlar)/)) 
      return "Merhaba! 🌸 Size nasıl yardımcı olabilirim?";

    // 2. ÇİÇEK BAKIMI (Özel Sorular)
    if (lower.includes("sula") || lower.includes("bakım") || lower.includes("soldu")) 
      return "Çiçek bakımı ipuçları: 💧 Suyunu 2 günde bir değiştirin. ✂️ Saplarını verev kesin. ☀️ Doğrudan güneş ışığından koruyun.";

    if (lower.includes("orkide")) 
      return "Orkideler haftada 1 kez daldırma yöntemiyle sulanmayı sever. Kökleri ışık almalıdır.";

    // 3. İADE VE SORUNLAR
    if (lower.includes("iade") || lower.includes("beğenmedim") || lower.includes("kırık")) 
      return "Üzgünüz! 😔 İade için 'Siparişlerim' sayfasından talep oluşturabilir veya 0850 123 45 67 hattımızı arayabilirsiniz. Canlı desteğe bağlıyorum...";

    // 4. SATICI SORULARI
    if (lower.includes("satıcı") || lower.includes("dükkan") || lower.includes("ürün ekle")) 
      return "Satıcı panelinden 'Ürünler' sekmesine gidip '+ Yeni Ürün' butonuna basarak fotoğraf ve stok bilgisiyle ürün ekleyebilirsiniz.";

    // 5. KARGO
    if (lower.includes("kargo") || lower.includes("nerede")) 
      return "Siparişinizi 'Siparişlerim' menüsünden takip edebilirsiniz. Kuryelerimiz anlık konum paylaşır.";

    // 6. MÜŞTERİ TEMSİLCİSİ
    if (lower.includes("insan") || lower.includes("temsilci") || lower.includes("bağla")) 
      return "Sizi hemen müsait bir müşteri temsilcisine aktarıyorum... ⏳ (Şaka yapıyorum, şu an sadece ben varım ama mail atarsanız döneriz: destek@ciceksepeti.uk)";

    return "Bunu tam anlayamadım. 🤔 'Kargo', 'İade', 'Orkide bakımı' gibi konuları sorabilirsiniz.";
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTimeout(() => {
      const botReply = { text: getBotResponse(userMessage.text), sender: "bot" };
      setMessages((prev) => [...prev, botReply]);
    }, 600);
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    const userMessage = { text: question, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setTimeout(() => {
        setMessages((prev) => [...prev, { text: getBotResponse(question), sender: "bot" }]);
    }, 600);
  };

  return (
    // --- DEĞİŞİKLİK BURADA: right-5 yerine left-5, items-end yerine items-start ---
    <div className="fixed bottom-5 left-5 z-[1000] flex flex-col items-start">
      
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up mb-4">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold">Canlı Destek</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm shadow-sm ${msg.sender === "user" ? "bg-purple-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
            {["Kargo durumu?", "İade politikası", "Telefon numarası"].map((q, i) => (
                <button key={i} onClick={() => handleQuickQuestion(q)} className="text-xs bg-white border border-purple-200 text-purple-600 px-3 py-1 rounded-full whitespace-nowrap hover:bg-purple-50 transition">{q}</button>
            ))}
          </div>
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Bir şeyler yazın..." className="flex-1 text-sm outline-none text-gray-700" />
            <button type="submit" className="text-purple-600 hover:text-purple-700 font-bold transform hover:scale-110 transition">➤</button>
          </form>
        </div>
      )}

      {/* YUVARLAK BUTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transition transform hover:scale-105 hover:rotate-12 hover:shadow-purple-500/40"
      >
        {isOpen ? <span className="text-2xl font-bold">✕</span> : <span className="text-3xl">💬</span>}
      </button>

    </div>
  );
};

export default Chatbot;