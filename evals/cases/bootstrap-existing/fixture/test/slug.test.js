import test from "node:test";
import assert from "node:assert/strict";
import { slug } from "../src/slug.js";

test("turns a page label into a slug", () => assert.equal(slug("  Hello World  "), "hello-world"));
