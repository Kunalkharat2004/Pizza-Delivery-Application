import app from "./src/app";
import { addNumbersInArray } from "./src/utils";
import request from "supertest";

describe("AppComponent", () => {
  it("should return 5", () => {
    expect(addNumbersInArray([1, 2, 3, 4, 5])).toBe(15);
  });

  it("should return statusCode 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});
