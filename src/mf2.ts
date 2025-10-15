import { MessageFormat, type MessagePart, type MessageMarkupPart } from 'messageformat';

export type TreeNode =
  | { type: 'text'; value: string }
  | { type: 'number'; value: string }
  | { type: 'bidi'; value: string }
  | { type: 'markup'; tag: string; attributes: Record<string, string>; children: TreeNode[] };

function partsToTree(parts: MessagePart<string>[]): TreeNode[] {
  const stack: TreeNode[][] = [[]];
  const markupStack: { tag: string; attributes: Record<string, string> }[] = [];

  for (const part of parts) {
    if (part.type === 'text' || part.type === 'string') {
      stack[stack.length - 1].push({
        type: 'text',
        value: String(part.value ?? ''),
      });
    } else if (part.type === 'bidiIsolation') {
      stack[stack.length - 1].push({
        type: 'bidi',
        value: String(part.value ?? ''),
      });
    } else if (part.type === 'number') {
      const numberValue = part.parts?.map((p) => p.value).join('') || String(part.value);
      stack[stack.length - 1].push({
        type: 'number',
        value: numberValue,
      });
    } else if (part.type === 'markup') {
      const markupPart = part as MessageMarkupPart;

      if (markupPart.kind === 'open') {
        const attributes: Record<string, string> = {};
        if (markupPart.options) {
          Object.entries(markupPart.options).forEach(([key, value]) => {
            attributes[key] = String(value);
          });
        }
        markupStack.push({
          tag: markupPart.name || 'span',
          attributes,
        });
        stack.push([]);
      } else if (markupPart.kind === 'close') {
        const children = stack.pop() || [];
        const markup = markupStack.pop();
        if (!markup) {
          console.warn(`Closing tag '${markupPart.name}' without matching open tag.`);
          continue;
        }

        if (markup.tag !== markupPart.name) {
          console.warn(`Mismatched closing tag: expected '${markup.tag}', got '${markupPart.name}'.`);
        }

        if (markup && stack.length > 0) {
          stack[stack.length - 1].push({
            type: 'markup',
            tag: markup.tag,
            attributes: markup.attributes,
            children,
          });
        }
      } else if (markupPart.kind === 'standalone') {
        const attributes: Record<string, string> = {};
        if (markupPart.options) {
          Object.entries(markupPart.options).forEach(([key, value]) => {
            attributes[key] = String(value);
          });
        }
        stack[stack.length - 1].push({
          type: 'markup',
          tag: markupPart.name || 'span',
          attributes,
          children: [],
        });
      }
    }
  }

  if (markupStack.length > 0) {
    markupStack.forEach((markup) => {
      console.warn(`Unclosed tag '${markup.tag}' detected at end of message.`);
    });
  }

  return stack[0];
}

type MF2ParserInput = {
  message: string,
  params: Record<string, any>,
  locale: string[],
};

export function mf2Parser({ message, params = {}, locale } : MF2ParserInput ) {
  try {
    const mf = new MessageFormat(locale, message);
    const parts = mf.formatToParts(params);
    return partsToTree(parts);
  } catch (error) {
    console.error('MF2 parsing error:', error);
    return [{ type: 'text', value: message }];
  }
}