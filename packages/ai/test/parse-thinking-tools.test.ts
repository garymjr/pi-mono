import { describe, expect, it } from "vitest";
import type { ThinkingContent } from "../src/types.js";
import { parseToolCallsFromThinking } from "../src/utils/parse-thinking-tools.js";

describe("parseToolCallsFromThinking", () => {
	it("should parse tool calls from thinking block", () => {
		const thinking: ThinkingContent = {
			type: "thinking",
			thinking: "Let me check the files:</thi>\n<bash>\n<command>ls -la</command>\n</bash>\nDone!",
			thinkingSignature: "",
		};

		const toolCalls = parseToolCallsFromThinking(thinking);
		expect(toolCalls).toHaveLength(1);
		expect(toolCalls[0].name).toBe("bash");
		expect(toolCalls[0].arguments.command).toBe("ls -la");
	});

	it("should parse tool call with multiple parameters", () => {
		const thinking: ThinkingContent = {
			type: "thinking",
			thinking: "Let me search:</thi>\n<search>\n<query>test</query>\n<path>/src</path>\n</search>\n",
			thinkingSignature: "",
		};

		const toolCalls = parseToolCallsFromThinking(thinking);
		expect(toolCalls).toHaveLength(1);
		expect(toolCalls[0].name).toBe("search");
		expect(toolCalls[0].arguments.query).toBe("test");
		expect(toolCalls[0].arguments.path).toBe("/src");
	});

	it("should return empty array for no tool calls", () => {
		const thinking: ThinkingContent = {
			type: "thinking",
			thinking: "Just thinking about the problem...",
			thinkingSignature: "",
		};

		const toolCalls = parseToolCallsFromThinking(thinking);
		expect(toolCalls).toHaveLength(0);
	});

	it("should parse multiple tool calls", () => {
		const thinking: ThinkingContent = {
			type: "thinking",
			thinking:
				"First I'll check files:</thi>\n<bash>\n<command>ls</command>\n</bash>\nThen I'll search:</thi>\n<search>\n<query>test</query>\n</search>\n",
			thinkingSignature: "",
		};

		const toolCalls = parseToolCallsFromThinking(thinking);
		expect(toolCalls).toHaveLength(2);
		expect(toolCalls[0].name).toBe("bash");
		expect(toolCalls[1].name).toBe("search");
	});
});
