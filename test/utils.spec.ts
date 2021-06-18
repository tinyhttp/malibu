// TODO: test salt length & secret length
// TODO: test timeSafeCompare()

import { suite } from "uvu";
import * as assert from "uvu/assert";
import { timeSafeCompare } from "../src/utils";

const tSC = suite("timeSafeCompare() test");

tSC("should return true for the same value", () => {
  const value = "qsLPe4XsiY2nxXvaD9fWsUXT65psYCoE";
  const result = timeSafeCompare(value, value);
  assert.is(result, true);
});

tSC("should return false without failing", () => {
  const valueA = "qsLPe4XsiY2nxXvaD9fWsUXT65psYCoE";
  const valueB = "R9qyjzGA8b6xz25kGQTBph65Na3WW57j";
  const result = timeSafeCompare(valueA, valueB);
  assert.is(result, false);
});

tSC("should return false without failing", () => {
  const valueA = "R9qyjzGA8b6xz25kG";
  const valueB = "XsiY2nxXvaD9fWsUXT65psYCoE";
  const result = timeSafeCompare(valueA, valueB);
  assert.is(result, false);
});

tSC.run();
