import type { ThinkingContent, ToolCall } from "../types.js";

const TAG_PATTERN = /<(\w+)>/gs;

export function parseToolCallsFromThinking(thinking: ThinkingContent): ToolCall[] {
	const toolCalls: ToolCall[] = [];
	const text = thinking.thinking;
	const allMatches = [...text.matchAll(TAG_PATTERN)];

	for (const match of allMatches) {
		const [, toolName] = match;
		const startPos = match.index;
		const closingTag = `</${toolName}>`;
		const endPos = text.indexOf(closingTag, startPos);

		if (endPos === -1) {
			continue;
		}

		const innerContent = text.slice(startPos + match[0].length, endPos);
		const isNested = allMatches.some(
			(otherMatch) =>
				otherMatch !== match &&
				otherMatch.index < startPos &&
				text.indexOf(`</${otherMatch[1]}>`, otherMatch.index) > endPos + closingTag.length,
		);

		if (isNested) {
			continue;
		}

		try {
			const args: Record<string, unknown> = {};
			const paramPattern = /<(\w+)>([^<]*)<\/\1>/g;
			const paramMatches = [...innerContent.matchAll(paramPattern)];
			for (const paramMatch of paramMatches) {
				const [, paramName, paramValue] = paramMatch;
				args[paramName] = paramValue.trim();
			}

			toolCalls.push({
				type: "toolCall",
				id: `${toolName}_${toolCalls.length}_${Date.now()}`,
				name: toolName,
				arguments: args,
			});
		} catch {}
	}

	return toolCalls;
}

export function extractToolCallsFromThinking(content: (ThinkingContent | any)[]): ToolCall[] {
	const toolCalls: ToolCall[] = [];

	for (const block of content) {
		if (block.type === "thinking") {
			const extracted = parseToolCallsFromThinking(block);
			toolCalls.push(...extracted);
		}
	}

	return toolCalls;
}
