import http from "http";
import assert from "assert";

const BASE_URL = "http://localhost:3000";

const request = (
  method: string,
  path: string,
  data?: any
): Promise<{ status: number; body: any }> => {
  return new Promise((resolve, reject) => {
    const payload = data ? Buffer.from(JSON.stringify(data)) : null;

    const req = http.request(
      `${BASE_URL}${path}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload?.length || 0,
        },
      },
      (res) => {
        const chunks: Uint8Array[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const bodyStr = Buffer.concat(chunks).toString();
          const body = bodyStr ? JSON.parse(bodyStr) : null;
          resolve({ status: res.statusCode || 0, body });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

(async () => {
  const res1 = await request("GET", "/api/users");
  assert.strictEqual(res1.status, 200);
  assert.ok(Array.isArray(res1.body));

  const newUser = { username: "Alice", age: 30, hobbies: ["reading"] };
  const res2 = await request("POST", "/api/users", newUser);
  assert.strictEqual(res2.status, 201);
  assert.ok(res2.body.id);

  const userId = res2.body.id;

  const res3 = await request("GET", `/api/users/${userId}`);
  assert.strictEqual(res3.status, 200);
  assert.strictEqual(res3.body.username, "Alice");

  const updatedUser = {
    username: "Alice Updated",
    age: 31,
    hobbies: ["travel"],
  };
  const res4 = await request("PUT", `/api/users/${userId}`, updatedUser);
  assert.strictEqual(res4.status, 200);
  assert.strictEqual(res4.body.username, "Alice Updated");

  const res5 = await request("DELETE", `/api/users/${userId}`);
  assert.strictEqual(res5.status, 204);

  const res6 = await request("GET", `/api/users/${userId}`);
  assert.strictEqual(res6.status, 404);

  console.log(" All tests passed successfully!");
})();
