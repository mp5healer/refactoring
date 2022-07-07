import { ugleStatement } from "./ugly";
import { plays, invoices } from "./data";
import { newStatement } from "./new";

test("test", () => {
  expect(ugleStatement(invoices[0], plays)).toBe(
    newStatement(invoices[0], plays)
  );
});
