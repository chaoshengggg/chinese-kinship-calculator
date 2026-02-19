// Utility to play Chinese text using browser SpeechSynthesis API
export function playPronunciation(text) {
  if (!window.speechSynthesis) return;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = 'zh-CN';
  utter.rate = 0.7; // slower, more natural
  utter.pitch = 1.1; // slightly higher for clarity
  utter.volume = 1;
  // Try to select a Chinese voice if available
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find(v => v.lang.startsWith('zh'));
  if (zhVoice) utter.voice = zhVoice;
  window.speechSynthesis.speak(utter);
}
