// شجرة الفرز القاعدية - أسئلة اختيارية لكل شكوى شائعة
// كل سؤال له: نص، خيارات، علامة خطر (إن وجدت)، والسؤال التالي

export const TRIAGE_FLOWS = {
  headache: {
    title: "فرز الصداع",
    questions: [
      {
        id: "sudden",
        text: "هل بدأ الصداع فجأة وبلغ أقصى شدته خلال دقيقة (أسوأ صداع في حياتك)؟",
        options: [
          { value: "yes", label: "نعم", danger: true, result: "emergency", message: "صداع رعدي - خطر نزيف دماغي محتمل" },
          { value: "no", label: "لا", next: "fever" }
        ]
      },
      {
        id: "fever",
        text: "هل يصاحبه حرارة عالية أو تيبس في الرقبة؟",
        options: [
          { value: "yes", label: "نعم", danger: true, result: "emergency", message: "قد يكون التهاب سحايا" },
          { value: "no", label: "لا", next: "vision" }
        ]
      },
      {
        id: "vision",
        text: "هل هناك تشوش في الرؤية أو ضعف في أحد الأطراف؟",
        options: [
          { value: "yes", label: "نعم", danger: true, result: "emergency", message: "علامات عصبية - طوارئ" },
          { value: "no", label: "لا", next: "duration" }
        ]
      },
      {
        id: "duration",
        text: "منذ متى وأنت تشعر بالصداع؟",
        options: [
          { value: "hours", label: "ساعات قليلة", next: "history" },
          { value: "days", label: "أيام", next: "history" },
          { value: "weeks", label: "أسابيع أو أكثر", next: "history" }
        ]
      },
      {
        id: "history",
        text: "هل تعاني من صداع نصفي (شقيقة) سابقًا؟",
        options: [
          { value: "yes", label: "نعم، عندي تاريخ", next: "final" },
          { value: "no", label: "لا، هذه أول مرة", next: "final" }
        ]
      }
    ]
  },
  sore_throat: {
    title: "فرز التهاب الحلق",
    questions: [
      {
        id: "breathing",
        text: "هل تواجه صعوبة في التنفس أو البلع؟",
        options: [
          { value: "yes", label: "نعم", danger: true, result: "emergency", message: "صعوبة تنفس/بلع - طوارئ" },
          { value: "no", label: "لا", next: "fever" }
        ]
      },
      {
        id: "fever",
        text: "هل هناك حرارة عالية؟",
        options: [
          { value: "yes", label: "نعم", next: "duration" },
          { value: "no", label: "لا", next: "duration" }
        ]
      },
      {
        id: "duration",
        text: "منذ متى والأعراض موجودة؟",
        options: [
          { value: "1-3", label: "1-3 أيام", next: "final" },
          { value: "more", label: "أكثر من 3 أيام", next: "final" }
        ]
      }
    ]
  }
};

// قائمة الشكاوى المتاحة
export const COMPLAINTS = [
  { id: "headache", label: "الصداع", icon: "🤕" },
  { id: "sore_throat", label: "التهاب الحلق", icon: "🗣️" },
  { id: "chest_pain", label: "ألم الصدر", icon: "💔" },
  { id: "abdominal", label: "ألم البطن", icon: "🫃" },
  { id: "fever", label: "الحمى", icon: "🌡️" },
  { id: "other", label: "أخرى", icon: "💬" }
];
