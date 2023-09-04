import { getChecksumAddress } from "./util/eip55";
import { CustomRpcProvider } from "./util/jsonRpc";
import { QueryTool } from "./util/queryTool";

const END_POINT = "";
const CA = "";

async function main() {
  const provider = new CustomRpcProvider(END_POINT);
  if ((await provider.getCode(CA)) === "0x") throw new Error("this contract not deployed or EOA");

  const latestBlockNumber = await provider.blockNumber();
  const queryTool = new QueryTool(provider);

  console.time("binary search took ");
  const contractDeployedBlockNumber = await queryTool.binarySearchDeployedBlock(
    CA,
    latestBlockNumber,
    0
  );
  console.timeEnd("binary search took ");

  const contractDeployedTx = await queryTool.getContractDeployedTx(CA, contractDeployedBlockNumber);
  const { hash, from, blockNumber, deployedBy } = contractDeployedTx;

  const ret = {
    deployer: getChecksumAddress(from),
    deployed_by: deployedBy,
    tx_hash: hash,
    block_number: parseInt(blockNumber, 16),
  };
  console.table(ret);
}

main().catch((err) => {
  console.log(err);
});
