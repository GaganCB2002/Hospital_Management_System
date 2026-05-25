import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiSend, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useHospital } from '../../context/HospitalContext';

const TYPING_DELAY = 600;

const QUESTIONS = [
  { key: 'firstName', ask: "Let's start! What's your **first name**?" },
  { key: 'lastName', ask: "Great! And what's your **last name**?" },
  { key: 'department', ask: "Which **department** would you like to visit? (e.g., Cardiology, Neurology, Pediatrics, etc.)" },
  { key: 'doctor', ask: "Do you have a preferred **doctor**? If not, just say \"any\" and I'll assign the best available." },
  { key: 'date', ask: "What **date** would you prefer? (YYYY-MM-DD)" },
  { key: 'time', ask: "What **time** works best for you? (e.g., 09:00 AM, 02:00 PM)" },
  { key: 'reason', ask: "Briefly describe your **symptoms** or reason for the visit:" },
  { key: 'contact', ask: "What's your **contact number** so the doctor can reach you?" },
  { key: 'email', ask: "Finally, what's your **email address**?" },
];

const GREETING = `Hello! 👋 I'm your **AI Health Assistant** at CurePulse Hospital.

I can help you with:
• 📅 **Book an appointment** — step by step
• 👨‍⚕️ **Find doctors & departments**
• 🏥 **Hospital info** — hours, services, insurance
• 🩺 **Health tips & symptom guidance**
• 🚨 **Emergency assistance**

Just type your question or select an option below!`;

const LOGIN_PROMPT = "To book an appointment, you'll need to log in first. Please click the button below to sign in.";

function getResponse(input) {
  const lower = input.toLowerCase().trim();

  if (/thanks|thank you|ty/.test(lower))
    return "You're welcome! 😊 If you need anything else, I'm just a message away. Stay healthy!";

  if (/hi|hello|hey|good morning|good evening/.test(lower))
    return "Hello! 👋 How can I assist you with your healthcare needs today?";

  if (/emergency|urgent|accident|critical|ambulance/.test(lower))
    return "🚨 **If this is a medical emergency, please call 911 or our emergency line: Ext. 1999 immediately.**\n\nOur emergency department is open 24/7. Would you like me to help book an urgent appointment once the situation is stable?";

  if (/fever|cough|cold|flu|symptom|sick|vomiting|nausea|headache|pain/.test(lower))
    return "I'm sorry you're not feeling well. 😔\n\nBased on your symptoms, I'd recommend:\n1. **Rest and stay hydrated**\n2. **Monitor your temperature** — if fever exceeds 102°F, seek immediate care\n3. **Book an appointment** with a General Medicine specialist for proper diagnosis\n\nWould you like me to help you book an appointment?";

  if (/heart|chest pain|cardiac|cardio/.test(lower))
    return "❤️ **Chest pain or heart-related concerns are serious.** If you're experiencing chest pain, shortness of breath, or discomfort, please call 911 or visit our Emergency Department immediately.\n\nFor non-urgent cardiology consultations, our **Cardiology Department** has expert specialists like Dr. Sarah Chen and Dr. Helena Rossi. Would you like to book an appointment?";

  if (/diabetes|sugar|blood glucose|diabetic/.test(lower))
    return "🩸 For diabetes management, we recommend:\n• Regular **HbA1c monitoring** every 3 months\n• Consultation with **Endocrinology** or **General Medicine**\n• Diet and lifestyle counseling\n\nOur Dr. Sanjay Patil (Endocrinology) specializes in diabetes care. Would you like to book an appointment?";

  if (/insure|insurance|coverage|claim|cashless/.test(lower))
    return "🏥 **Insurance & Billing Information**\n\nWe accept all major insurance providers including:\n• **TPA Cashless** — Most corporate health plans\n• **Government schemes** — Ayushman Bharat, CGHS\n• **Private insurance** — Star Health, ICICI Lombard, etc.\n\nFor detailed insurance queries, please contact our **Billing Desk** at Ext. 3000 or visit the hospital's finance department.";

  if (/doctor|physician|specialist|consult/.test(lower))
    return "👨‍⚕️ **Our Medical Team**\n\nWe have expert doctors across departments:\n• **Cardiology** — Dr. Sarah Chen, Dr. Helena Rossi\n• **Neurology** — Dr. Anita Gupta, Dr. James Anderson\n• **Pediatrics** — Dr. James Wilson, Dr. Priya Kapoor\n• **Orthopedics** — Dr. Robert Jacqueline, Dr. Lisa Park\n• **General Medicine** — Dr. Rajesh Kumar, Dr. Kevin Chen\n\nWould you like me to help you book with any of them?";

  if (/hours|timing|open|close|visiting/.test(lower))
    return "🕐 **Hospital Hours**\n\n🏥 **OPD (Outpatient):** 8:00 AM — 8:00 PM (Mon-Sat)\n🩺 **Emergency:** 24/7 — Always Open\n📞 **Appointments & Enquiries:** +1 (555) 123-4567\n👥 **Visiting Hours:** 4:00 PM — 6:00 PM (Daily)\n\nWould you like to book an appointment?";

  if (/department|specialit|ward|clinic/.test(lower))
    return "🏥 **Our Departments**\n\n• Cardiology\n• Neurology\n• Pediatrics\n• Orthopedics\n• General Medicine\n• Dermatology\n• Ophthalmology\n• Surgery\n• Pulmonology\n• Nephrology\n• Gastroenterology\n• Oncology\n• Rheumatology\n• Endocrinology\n• Psychiatry\n• Radiology\n• ENT\n\nWhich department are you looking for?";

  if (/fee|cost|price|charge|bill|payment/.test(lower))
    return "💰 **Consultation Fees** (approx):\n• **General Medicine:** ₹800 — ₹1,500\n• **Specialists:** ₹1,800 — ₹3,200\n• **Super Specialists:** ₹3,000 — ₹5,000\n• **Emergency:** Varies by treatment\n\nFor a detailed estimate, please contact our billing desk. Would you like to book an appointment with a specific doctor?";

  if (/covid|vaccine|vaccination/.test(lower))
    return "💉 **Vaccination Services**\n\nWe offer:\n• **COVID-19 vaccination** (all age groups)\n• **Child immunization** programs (Pediatrics)\n• **Annual flu shots**\n• **Travel vaccines**\n\nPlease visit our **General Medicine** or **Pediatrics** department for vaccination. Would you like to book?";

  if (/lab|test|report|x-ray|mri|ct scan|blood test/.test(lower))
    return "🔬 **Lab & Diagnostic Services**\n\nOur lab is open **6:00 AM — 8:00 PM** (Mon-Sat).\n• **Blood tests** — Results in 4-6 hours\n• **X-Ray, MRI, CT Scan** — By appointment\n• **ECG, Echo, Stress Test** — Cardiology referral needed\n\nFor lab bookings, please call Ext. 2003 or visit the Lab Services counter.";

  if (/appointment|book|schedule|visit/.test(lower))
    return "📅 **I can help you book an appointment!** Just click the **Book Appointment** button below and I'll guide you through it step by step 👇";

  if (/bye|goodbye|see you|take care/.test(lower))
    return "Take care and stay healthy! 🏥💪 If you ever need assistance, I'm here 24/7. Goodbye! 👋";

  const depMatch = doctors.find(d => d.department && lower.includes(d.department.toLowerCase()));
  if (depMatch)
    return `**${depMatch.department} Department** — Great choice!\n\nWe have specialists like ${doctors.filter(d => d.department === depMatch.department).map(d => d.name).join(', ')}.\n\nWould you like to book an appointment in this department?`;

  const docMatch = doctors.find(d => d.name && lower.includes(d.name.toLowerCase().replace('dr. ', '')));
  if (docMatch)
    return `**${docMatch.name}** is available in the **${docMatch.department}** department.\n• Specialization: ${docMatch.specialization}\n• Experience: ${docMatch.experience}\n• Fee: ₹${docMatch.consultationFee}\n\nWould you like to book an appointment with ${docMatch.name}?`;

  return `I understand you're asking about "${input}". Here's what I can help you with:\n\n1. 📅 **Book an appointment** with a specialist\n2. 👨‍⚕️ **Find a doctor** by name or department\n3. 🏥 **Hospital info** — hours, services, insurance\n4. 🩺 **Symptom guidance** — basic health advice\n5. 🚨 **Emergency assistance** — 24/7 help\n\nCould you please be more specific or choose one of the options?`;
}

export default function AIHelpBot() {
  const { user } = useAuth();
  const { doctors, addAppointment } = useHospital();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [bookingStep, setBookingStep] = useState(-1);
  const [bookingData, setBookingData] = useState({});
  const [isBookFlow, setIsBookFlow] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const departments = useMemo(() => Array.from(new Set(doctors.map(d => d.department))).sort(), [doctors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages([{ role: 'bot', text: GREETING }]);
        setIsTyping(false);
      }, TYPING_DELAY);
    }
  }, [isOpen]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isOpen]);

  const addBotMsg = useCallback((text) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text }]);
      setIsTyping(false);
    }, TYPING_DELAY);
  }, []);

  const askNextQuestion = useCallback((step) => {
    if (step >= QUESTIONS.length) return;
    setIsBookFlow(true);
    setBookingStep(step);
    addBotMsg(QUESTIONS[step].ask);
  }, [addBotMsg]);

  const startBooking = useCallback(() => {
    setMessages(prev => [...prev, { role: 'user', text: '📅 Book Appointment' }]);
    if (!user) {
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: LOGIN_PROMPT }]);
        setIsTyping(false);
      }, TYPING_DELAY);
      return;
    }
    setBookingData({});
    setBookingStep(-1);
    setIsBookFlow(true);
    setTimeout(() => askNextQuestion(0), 400);
  }, [user, addBotMsg, askNextQuestion]);

  const processBookingAnswer = useCallback((answer) => {
    const step = bookingStep;
    if (step < 0 || step >= QUESTIONS.length) return;

    const key = QUESTIONS[step].key;
    const updated = { ...bookingData, [key]: answer };
    setBookingData(updated);
    setMessages(prev => [...prev, { role: 'user', text: answer }]);

    if (key === 'department') {
      const matched = departments.find(d => d.toLowerCase().includes(answer.toLowerCase()));
      if (!matched) {
        addBotMsg(`I couldn't find "${answer}" in our departments. Available options: ${departments.join(', ')}.\n\nPlease type the department name again:`);
        return;
      }
      updated.department = matched;
      setBookingData(updated);
      askNextQuestion(step + 1);
      return;
    }

    if (key === 'doctor') {
      if (answer.toLowerCase() === 'any' || answer.toLowerCase() === 'anyone' || answer.toLowerCase() === "any doctor") {
        const deptDocs = doctors.filter(d => d.department === updated.department);
        if (deptDocs.length > 0) {
          updated.doctor = deptDocs[0].name;
          updated.doctorId = deptDocs[0].doctorId;
          setBookingData(updated);
          addBotMsg(`I'll assign **${deptDocs[0].name}** from ${updated.department} department.`);
          setTimeout(() => askNextQuestion(step + 1), 600);
          return;
        }
      }
      const matched = doctors.find(d => d.name && d.name.toLowerCase().includes(answer.toLowerCase().replace('dr. ', '')));
      if (matched) {
        updated.doctor = matched.name;
        updated.doctorId = matched.doctorId;
        updated.department = matched.department;
        setBookingData(updated);
        addBotMsg(`**${matched.name}** (${matched.department}) — Great choice!`);
        setTimeout(() => askNextQuestion(step + 1), 600);
        return;
      }
      addBotMsg(`I couldn't find a doctor matching "${answer}". Would you like to:\n1. **Type "any"** to let me assign the best available doctor\n2. **Try a different name**\n3. See our **department list** first\n\nWhat would you like to do?`);
      return;
    }

    if (key === 'time') {
      const timePattern = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)/i;
      if (!timePattern.test(answer)) {
        addBotMsg("Please enter a valid time like **09:00 AM** or **02:00 PM**:");
        return;
      }
    }

    if (key === 'date') {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(answer)) {
        addBotMsg("Please enter the date in **YYYY-MM-DD** format (e.g., 2026-06-15):");
        return;
      }
      const d = new Date(answer);
      if (isNaN(d.getTime())) {
        addBotMsg("That doesn't look like a valid date. Please try again in **YYYY-MM-DD** format:");
        return;
      }
    }

    if (key === 'contact') {
      const phoneClean = answer.replace(/[\s-]/g, '');
      if (phoneClean.length < 10) {
        addBotMsg("Please enter a valid contact number (at least 10 digits):");
        return;
      }
    }

    if (key === 'email') {
      if (!answer.includes('@') || !answer.includes('.')) {
        addBotMsg("Please enter a valid email address (e.g., name@example.com):");
        return;
      }
    }

    if (step + 1 >= QUESTIONS.length) {
      setBookingStep(-1);
      submitBooking(updated);
      return;
    }

    askNextQuestion(step + 1);
  }, [bookingStep, bookingData, departments, doctors, addBotMsg, askNextQuestion]);

  const submitBooking = useCallback(async (data) => {
    setIsTyping(true);
    setTimeout(async () => {
      setIsTyping(false);
      const doc = doctors.find(d => d.doctorId === data.doctorId) || doctors.find(d => d.name === data.doctor);
      const fullName = `${data.firstName} ${data.lastName}`;
      try {
        await addAppointment({
          patient: fullName,
          patientId: user?.id || '',
          doctor: doc?.name || data.doctor || 'Assigned Doctor',
          doctorId: doc?.doctorId || '',
          department: data.department || doc?.department || 'General',
          doctorSpecialization: doc?.specialization || '',
          date: data.date,
          time: data.time,
          type: 'Consultation',
          status: 'Pending',
          notes: data.reason || '',
          contactPhone: data.contact || '',
          contactEmail: data.email || '',
          bookingMode: 'Online',
          bookingSource: 'AI Help Bot',
          fees: doc?.consultationFee || 0,
        }, fullName);
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `✅ **Appointment Booked Successfully!** 🎉

Here's your **booking summary:**

📋 **Patient:** ${fullName}
👨‍⚕️ **Doctor:** ${doc?.name || data.doctor} (${data.department || doc?.department})
📅 **Date:** ${data.date}
⏰ **Time:** ${data.time}
📌 **Status:** Pending Confirmation

You'll receive a confirmation via SMS/Email shortly. Is there anything else I can help you with?`
        }]);
        toast.success('Appointment booked successfully!');
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: `❌ Sorry, there was an error booking your appointment: ${err.message || 'Please try again.'}\n\nYou can also book directly from the **Appointments** section.`
        }]);
        toast.error('Failed to book appointment');
      }
      setIsBookFlow(false);
      setBookingStep(-1);
    }, 800);
  }, [doctors, user, addAppointment]);

  const handleUserMessage = useCallback((text) => {
    if (!text.trim()) return;
    setChatInput('');

    if (isBookFlow && bookingStep >= 0 && bookingStep < QUESTIONS.length) {
      processBookingAnswer(text.trim());
      return;
    }

    setMessages(prev => [...prev, { role: 'user', text: text.trim() }]);
    addBotMsg(getResponse(text.trim()));
  }, [isBookFlow, bookingStep, addBotMsg, processBookingAnswer]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage(chatInput);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer border-none"
        aria-label="Open AI Help Assistant">
        <FiMessageSquare className="text-2xl" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[calc(100vh-8rem)] bg-surface rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/20 to-transparent border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <FiMessageSquare className="text-primary text-sm" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-background">AI Help Assistant</h3>
                  <p className="text-[9px] text-emerald-400">● Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isBookFlow && (
                  <button onClick={() => { setIsBookFlow(false); setBookingStep(-1); setBookingData({}); }}
                    className="px-2 py-1 rounded-lg bg-white/10 text-on-surface-variant text-[9px] font-semibold hover:bg-white/20 cursor-pointer border-none">
                    Cancel
                  </button>
                )}
                <button onClick={() => { setIsOpen(false); setIsBookFlow(false); setBookingStep(-1); setBookingData({}); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-on-surface-variant cursor-pointer border-none bg-transparent">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-background text-on-background rounded-bl-md border border-white/5'
                  }`}>
                    {msg.text.split('\n').map((line, j) => (
                      <span key={j}>{line}<br /></span>
                    ))}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-background text-on-surface-variant px-3.5 py-2.5 rounded-2xl rounded-bl-md border border-white/5 text-xs">
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="shrink-0 border-t border-white/5 bg-background/50 p-3">
              {isBookFlow && bookingStep < 0 ? null : (
                <div className="flex gap-2">
                  <input ref={inputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isBookFlow ? "Type your answer and press Enter..." : "Ask me anything..."}
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface text-on-background border border-white/10 outline-none focus:border-primary placeholder:text-on-surface-variant/50" />
                  <button onClick={() => handleUserMessage(chatInput)}
                    disabled={!chatInput.trim()}
                    className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-40 cursor-pointer border-none flex items-center gap-1">
                    <FiSend size={14} />
                  </button>
                </div>
              )}
              {!isBookFlow && messages.length <= 1 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button onClick={() => startBooking()}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-semibold hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer border-solid">
                    📅 Book Appointment
                  </button>
                  <button onClick={() => handleUserMessage('Show doctors')}
                    className="px-2.5 py-1 rounded-lg bg-surface text-on-surface-variant text-[10px] font-semibold hover:bg-primary/10 hover:text-primary border border-white/10 transition-all cursor-pointer border-solid">
                    👨‍⚕️ Find Doctors
                  </button>
                  <button onClick={() => handleUserMessage('Hospital hours')}
                    className="px-2.5 py-1 rounded-lg bg-surface text-on-surface-variant text-[10px] font-semibold hover:bg-primary/10 hover:text-primary border border-white/10 transition-all cursor-pointer border-solid">
                    🕐 Hours
                  </button>
                  <button onClick={() => handleUserMessage('Emergency')}
                    className="px-2.5 py-1 rounded-lg bg-surface text-on-surface-variant text-[10px] font-semibold hover:bg-primary/10 hover:text-primary border border-white/10 transition-all cursor-pointer border-solid">
                    🚨 Emergency
                  </button>
                </div>
              )}
              {!user && messages.some(m => m.role === 'bot' && m.text.includes('log in')) && (
                <button onClick={() => navigate('/login')}
                  className="mt-2 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 cursor-pointer border-none flex items-center justify-center gap-1.5">
                  <FiCalendar /> Login to Book Appointment
                </button>
              )}
              {isBookFlow && bookingStep >= 0 && (
                <p className="text-[9px] text-on-surface-variant text-center mt-1.5">
                  Step {bookingStep + 1} of {QUESTIONS.length}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
