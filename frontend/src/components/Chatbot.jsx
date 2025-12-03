import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Chatbot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  // page name
  const [messages, setMessages] = useState([
    { text: t("chatBot.greeting"), sender: "bot" }
  ]);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // --- YENİ: AKILLI CEVAP SİSTEMİ ---
  const getBotResponse = (text) => {
    const lower = text.toLowerCase();

    // 1. Selamlaşma
    if (lower.match(/(merhaba|selam|hey|günaydın|morning|good morning|good day|iyi akşamlar)/)) 
      return t("chatBot.greetingResponse");

    // 2. Bakım
    if (lower.includes("soldu") || lower.includes("bakım") || lower.includes("sula") || lower.includes("ömrü")) 
      return "Bitki Bakım İpuçları: 🌿\n1. Suyu 2 günde bir değiştirin.\n2. Sapları verev (çapraz) kesin.\n3. Doğrudan güneşten ve cereyandan koruyun.\nOrkideler için haftada 1 daldırma yöntemi önerilir.";

    // 3. İade
    if (lower.includes("iade") || lower.includes("beğenmedim") || lower.includes("kırık") || lower.includes("sorun")) 
      return "Üzgünüz! 😔 İade talebi oluşturmak için 'Siparişlerim' sayfasına gidip ilgili siparişi seçerek 'İade Et' butonuna basabilirsiniz. Veya destek@ciceksepeti.uk adresine fotoğraflı mail atabilirsiniz.";

    // 4. Satıcı
    if (lower.includes("satıcı") || lower.includes("dükkan") || lower.includes("ürün ekle") || lower.includes("stok")) 
      return "Satıcılarımız İçin: 🏪\nMağaza paneline giriş yaptıktan sonra 'Ürünler' sekmesinden yeni ürün ekleyebilir, stok güncelleyebilir ve fiyatları değiştirebilirsiniz. Sorun yaşarsanız satıcı destek hattımızı arayın.";

    // 5. Kargo
    if (lower.includes("kargo") || lower.includes("nerede") || lower.includes("teslimat") || lower.includes("gelmedi")) 
      return "Siparişinizi 'Siparişlerim' menüsünden anlık takip edebilirsiniz. 🛵 Kuryelerimiz yola çıktığında size SMS ile bilgi verilecektir.";

    // 6. Müşteri Temsilcisi
    if (lower.includes("insan") || lower.includes("temsilci") || lower.includes("bağla") || lower.includes("canlı destek")) 
      return "Sizi müşteri temsilcisine aktarıyorum... ⏳\n(Şu an tüm temsilcilerimiz meşgul, lütfen sorunuzu buraya yazın veya 0850 123 45 67'yi arayın.)";

    return "Bunu tam anlayamadım. 🤔 Şunları sorabilirsiniz:\n- 'Çiçeğim nasıl bakılır?'\n- 'Kargom nerede?'\n- 'Satıcı panelini nasıl kullanırım?'";
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
    <div className="fixed bottom-5 left-5 z-[1000] flex flex-col items-start">
      
      {isOpen && (
        <div className="bg-white w-80 h-96 rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-up mb-4">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold">Canlı Destek</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-bold">✕</button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm shadow-sm whitespace-pre-line ${msg.sender === "user" ? "bg-purple-600 text-white rounded-br-none" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Hazır Sorular */}
          <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
            {["Kargom Nerede?", "Çiçek Bakımı", "İade İşlemleri", "Satıcı Destek"].map((q, i) => (
                <button key={i} onClick={() => handleQuickQuestion(q)} className="text-xs bg-white border border-purple-200 text-purple-600 px-3 py-1 rounded-full whitespace-nowrap hover:bg-purple-50 transition">{q}</button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Bir şeyler yazın..." className="flex-1 text-sm outline-none text-gray-700" />
            <button type="submit" className="text-purple-600 hover:text-purple-700 font-bold transform hover:scale-110 transition">➤</button>
          </form>
        </div>
      )}

      {/* Buton */}
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