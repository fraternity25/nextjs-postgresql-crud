export function splitFirst(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index === -1) {
        return [str, '']; // delimiter not found
    }
    return [
        str.substring(0, index),
        str.substring(index + delimiter.length)
    ];
}

export function toastMessagesToString(toastMessages) {
  return toastMessages.map((msg) => {
    if (msg.type === 'h1') return `# ${msg.content}`;
    if (msg.type === 'h2') return `## ${msg.content}`;
    if (msg.type === 'h3') return `### ${msg.content}`;
    if (msg.type === 'p') return msg.content;
    if (msg.type === 'ul') return msg.content.map(item => `- ${item}`).join('\n');
    if (msg.type === 'ol') return msg.content.map((item, index) => `${index + 1}. ${item}`).join('\n');
    return msg.content;
  }).join("\n");
}

export function stringToToastMessages(str) {
  const lines = str.split('\n');
  const messages = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      messages.push({ type: 'h1', content: line.slice(2) });
    } else if (line.startsWith('## ')) {
      messages.push({ type: 'h2', content: line.slice(3) });
    } else if (line.startsWith('### ')) {
      messages.push({ type: 'h3', content: line.slice(4) });
    } else if (line.startsWith('- ')) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.type === 'ul') {
        lastMsg.content.push(line.slice(2));
      } else {
        messages.push({ type: 'ul', content: [line.slice(2)] });
      }
    } else if (line.startsWith('1. ')) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.type === 'ol') {
        lastMsg.content.push(line.slice(3));
      } else {
        messages.push({ type: 'ol', content: [line.slice(3)] });
      }
    } else {
      messages.push({ type: 'p', content: line });
    }
  }

  return messages;
}