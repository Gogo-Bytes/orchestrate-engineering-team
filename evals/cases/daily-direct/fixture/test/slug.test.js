import test from "node:test";
import assert from "node:assert/strict";
import { slug } from "../src/slug.js";

test("collapses repeated spaces", () => assert.equal(slug("Hello   World"), "hello-world"));
test("keeps a one-space label", () => assert.equal(slug("One Page"), "one-page"));
