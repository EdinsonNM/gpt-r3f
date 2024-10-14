import PropTypes from "prop-types";
import { useState } from "react";

function SpeechRecognition({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleVoiceCommand = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "es-PE";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
    };

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      onTranscript(speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  return (
    <>
      <button
        id="listeningButton"
        className={`pointer-events-auto ${
          listening ? "bg-red-500" : "bg-green-500"
        } hover:bg-green-600 text-white font-bold py-4 px-4 rounded-full `}
        onClick={handleVoiceCommand}
        disabled={listening}
      >
        <span id="buttonText">
          {listening ? "Listening..." : "Start Listening"}
        </span>
      </button>
      <div className="mt-3">{transcript}</div>
    </>
  );
}

SpeechRecognition.propTypes = {
  onTranscript: PropTypes.func,
};
export default SpeechRecognition;
