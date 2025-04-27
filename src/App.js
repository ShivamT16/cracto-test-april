/* global chrome */
import React, { useEffect, useState } from 'react';

function App() {
  const [highlights, setHighlights] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chrome.storage.local.get(['highlights'], (res) => {
      setHighlights(res.highlights || []);
    });
  }, []);

  const deleteHighlight = (index) => {
    const updated = highlights.filter((_, i) => i !== index);
    chrome.storage.local.set({ highlights: updated }, () => {
      setHighlights(updated);
    });
  };

  const summarizeHighlights = async () => {
    if (highlights.length === 0) return;

    setLoading(true);
    const fullText = highlights.map(h => h.text).join('\n');
    console.log(fullText)
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: `Summarize the following highlights:\n${fullText}` }],
        }),
      });

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content || 'No summary returned.';
      console.log("OpenAI API response:", data);
      setSummary(message);
    } catch (err) {
      setSummary('Error while summarizing.');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ width: 300, padding: 10 }}>
      <h3>Saved Highlights</h3>
      <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
        {highlights.map((h, i) => (
          <li key={i} style={{ marginBottom: 10 }}>
            <div>"{h.text}"</div>
            <small>{h.url}</small><br />
            <button onClick={() => deleteHighlight(i)}>Delete</button>
          </li>
        ))}
      </ul>

      {highlights.length > 0 && (
        <button onClick={summarizeHighlights} disabled={loading}>
          {loading ? 'Summarizing...' : 'Summarize'}
        </button>
      )}

      {summary && (
        <div style={{ marginTop: 10 }}>
          <strong>Summary:</strong>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
