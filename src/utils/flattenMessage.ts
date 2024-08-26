interface NestedMessages {
  [key: string]: string | NestedMessages;
}

function flattenMessages(nestedMessages: NestedMessages, prefix = ''): { [key: string]: string } {
  return Object.keys(nestedMessages).reduce((messages: { [key: string]: string }, key: string) => {
    const value = nestedMessages[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      messages[prefixedKey] = value;
    } else {
      Object.assign(messages, flattenMessages(value, prefixedKey));
    }

    return messages;
  }, {});
}

export default flattenMessages;