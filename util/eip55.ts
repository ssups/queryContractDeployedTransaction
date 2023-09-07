import keccak256 from "keccak256";

export function getChecksumAddress(address: string) {
  address = address.replace("0x", "").toLowerCase();
  if (address.length !== 40) throw new Error("wrong address");

  const hashed = keccak256(address).reduce(
    (acc, cur) => (acc += cur.toString(16).padStart(2, "0")),
    "0x"
  );

  let ret = "0x";
  for (let i = 0; i < address.length; i++) {
    if (parseInt(hashed[i], 16) >= 8) ret += address[i].toUpperCase();
    else ret += address[i];
  }

  return ret;
}
