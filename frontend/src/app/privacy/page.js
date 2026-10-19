import Link from "next/link";

export const metadata = {
  title: "Privacy Notice | CSCSKB Online",
  description: "Privacy notice for the CSCSKB Online recruitment updates and AI assistant.",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 18px", lineHeight: 1.7, color: "#eaf1ff" }}>
      <p><Link href="/jobs" style={{ color: "#9fc8ff" }}>← वापस भर्ती पोर्टल पर जाएँ</Link></p>
      <h1>Privacy Notice / गोपनीयता सूचना</h1>
      <p><strong>Effective date:</strong> 19 October 2026</p>
      <p>यह सूचना CSCSKB Online के Jobs &amp; Recruitment portal, live official-portal checker और conversational assistant के लिए है। यह सूचना CSCSKB Online / CSC business द्वारा उपलब्ध कराई गई जानकारी के आधार पर तैयार की गई है। यह कानूनी सलाह या DPDP compliance certification नहीं है; लागू प्रावधानों, डेटा-प्रवाह और सेवा प्रदाताओं की समीक्षा आवश्यक है।</p>
      <h2>1. कौन-सा डेटा प्रोसेस होता है?</h2>
      <ul>
        <li><strong>Live recruitment checker:</strong> यह SSC, UPPSC, UPSSSC, Railway Recruitment और UP Police के सार्वजनिक वेबसाइट पेजों को चेक करता है। यह user का नाम, chat या uploaded files इन वेबसाइटों को नहीं भेजता।</li>
        <li><strong>AI chat:</strong> सहमति देने और संदेश भेजने पर आपके लिखे हुए संदेश तथा हाल की chat context, जवाब बनाने के लिए OpenRouter API को भेजे जाते हैं। चुना गया मॉडल <code>inclusionai/ling-3.0-flash:free</code> है और application-level provider fallback बंद है। OpenRouter और model/provider की अपनी data-handling तथा retention policies अलग हो सकती हैं; इस वेबसाइट के पास उन सभी की स्वतंत्र पुष्टि नहीं है।</li>
        <li><strong>File attachments:</strong> इस assistant implementation में PDF/DOC/DOCX फाइलों की सामग्री AI API को नहीं भेजी जाती। फाइल के नाम chat history के साथ AI को नहीं भेजे जाते। Image optimization ब्राउज़र में होती है।</li>
        <li><strong>Voice:</strong> voice input browser speech-recognition feature पर निर्भर है। Browser/vendor audio processing और privacy terms लागू हो सकते हैं। AI response को सुनाने के लिए browser speech synthesis उपयोग होता है।</li>
        <li><strong>Technical data:</strong> hosting/provider infrastructure request metadata और security logs रख सकता है। इस notice में कोई निश्चित retention अवधि का दावा नहीं किया जाता जब तक configuration verify न हो।</li>
      </ul>
      <h2>2. उद्देश्य और न्यूनतम डेटा</h2>
      <p>डेटा का उपयोग केवल आपके recruitment/exam प्रश्न का जवाब बनाने, आधिकारिक सार्वजनिक भर्ती लिंक दिखाने, और service/security बनाए रखने के लिए किया जाना चाहिए। Chat में Aadhaar number, OTP, password, bank details या अन्य संवेदनशील व्यक्तिगत जानकारी न डालें।</p>
      <h2>3. सहमति और नियंत्रण</h2>
      <p>AI assistant को chat message भेजने से पहले स्पष्ट consent checkbox आवश्यक है। आप checkbox अनचेक करके आगे की AI processing रोक सकते हैं। इस फीचर में chat history को application database में स्थायी रूप से सेव करने का इरादा नहीं है; यह पेज खुला रहने तक browser memory में रह सकती है। Provider/hosting logs के बारे में उनकी लागू policies देखें।</p>
      <h2>4. आपके अधिकार और संपर्क</h2>
      <p>लागू कानून और उसके commencement/enforcement timeline के अधीन, आप अपने personal data के बारे में जानकारी, correction, erasure, consent withdrawal और शिकायत संबंधी अधिकारों का उपयोग कर सकते हैं। अनुरोध के लिए नीचे दिए गए संपर्क पर लिखें; अनुरोध की पुष्टि और जवाब लागू कानून तथा सत्यापित प्रक्रिया के अनुसार किया जाएगा।</p>
      <p><strong>Privacy / grievance contact:</strong> <a href="mailto:tiwarijicscs@gmail.com" style={{ color: "#9fc8ff" }}>tiwarijicscs@gmail.com</a></p>
      <p><strong>Data Fiduciary identity:</strong> CSCSKB Online / CSC business (जैसा वेबसाइट संचालक ने बताया है)।</p>
      <p><strong>महत्वपूर्ण legal detail अभी लंबित:</strong> इस नाम से संबंधित व्यक्ति/कानूनी इकाई का पूरा कानूनी नाम, व्यवसाय का पंजीकृत पता, और लागू होने पर proprietorship/कंपनी की पहचान स्वतंत्र रूप से सत्यापित नहीं हुई है। लॉन्च से पहले इन्हें सही रूप में प्रकाशित करें।</p>
      <h2>5. सुरक्षा और तृतीय-पक्ष सेवाएँ</h2>
      <p>API key server-side environment variable में रहनी चाहिए, browser code में नहीं। AI API को केवल consent के बाद call किया जाना चाहिए। OpenRouter तथा hosting provider की वर्तमान terms, data retention, processing location और incident-response obligations को launch से पहले review करें।</p>
      <h2>6. अपडेट</h2>
      <p>इस सूचना में बदलाव होने पर effective date अपडेट की जाएगी। Live recruitment links केवल सार्वजनिक पेजों से निकाले गए links हो सकते हैं; वे किसी vacancy के अभी खुले होने का प्रमाण नहीं हैं। कृपया आधिकारिक notification देखें।</p>
    </main>
  );
}
