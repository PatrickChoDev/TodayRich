import crypto from "crypto";

async function hashPassword(password, saltRounds, callback) {
  crypto.randomBytes(saltRounds, (err, salt) => {
    if (err) return callback(err);

    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) return callback(err);

      const hash = `${salt.toString("hex")}:${derivedKey.toString("hex")}`;

      callback(null, hash);
    });
  });
}

async function comparePasswords(password, hashedPassword, callback) {
  const [salt, storedHash] = hashedPassword.split(":");

  crypto.pbkdf2(
    password,
    Buffer.from(salt, "hex"),
    100000,
    64,
    "sha512",
    (err, derivedKey) => {
      if (err) return callback(err);

      const inputHash = derivedKey.toString("hex");

      callback(null, inputHash === storedHash);
    },
  );
}

export { hashPassword, comparePasswords };
