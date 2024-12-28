import { addNumbersInArray } from "./src/utils";

describe("AppComponent", () => {
  it("should return 5", () => {
    expect(addNumbersInArray([1, 2, 3, 4, 5])).toBe(15);
  });
});
