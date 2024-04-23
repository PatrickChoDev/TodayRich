import crypto from "crypto";

function base64urlEncode(str) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64urlDecode(str) {
  return Buffer.from(
    str.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString();
}

function sign(payload, secret, options = { expiresIn: "1h" }) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const headerEncoded = base64urlEncode(JSON.stringify(header));
  const payloadEncoded = base64urlEncode(JSON.stringify(payload));

  const expiresIn = options.expiresIn;
  const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;

  const dataToSign = `${headerEncoded}.${payloadEncoded}.${expirationTime}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64");
  const signatureEncoded = base64urlEncode(signature);

  return `${headerEncoded}.${payloadEncoded}.${expirationTime}.${signatureEncoded}`;
}

function verify(token, secret) {
  const [headerEncoded, payloadEncoded, expirationTime, signatureEncoded] =
    token.split(".");

  const dataToSign = `${headerEncoded}.${payloadEncoded}.${expirationTime}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64");
  const expectedSignatureEncoded = base64urlEncode(expectedSignature);

  if (
    signatureEncoded === expectedSignatureEncoded &&
    parseInt(expirationTime) > Math.floor(Date.now() / 1000)
  ) {
    return JSON.parse(base64urlDecode(payloadEncoded));
  }

  throw new Error("Invalid token");
}

export { sign, verify };
