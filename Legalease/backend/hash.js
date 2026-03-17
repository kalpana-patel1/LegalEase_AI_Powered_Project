import bcrypt from "bcryptjs";

const generateHash = async () => {
  const hash = await bcrypt.hash("admin123", 10);
  console.log(hash);
};

generateHash();
