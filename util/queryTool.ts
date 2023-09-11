import { getChecksumAddress } from "./eip55";
import { CustomRpcProvider } from "./jsonRpc";

export class QueryTool {
  constructor(private provider: CustomRpcProvider) {}

  async binarySearchDeployedBlock(
    contractAddress: string,
    high: number,
    low: number
  ): Promise<any> {
    if (high < low) throw new Error("High must be bigger than low");
    if (high === low) return high;

    const mid = Math.floor((high + low) / 2);

    return (await this._isContractExistBlock(contractAddress, mid))
      ? this.binarySearchDeployedBlock(contractAddress, mid, low)
      : this.binarySearchDeployedBlock(contractAddress, high, mid + 1);
  }

  async getContractDeployedTx(contractAddress: string, blockNumber: number) {
    let deployedBy = "EOA";

    const blockWithTransactions = await this.provider.getBlockByNumber(blockNumber, true);
    if (!blockWithTransactions) throw new Error("");

    // deplyed by EOA
    const promises = blockWithTransactions.transactions.map(async (tx: any) => {
      if (!tx.to) {
        const receipt = await this.provider.getTransactionReceipt(tx.hash);
        if (receipt && receipt.contractAddress == contractAddress.toLowerCase()) return tx;
      }
    });
    let resTx = (await Promise.all(promises)).filter((el) => el);

    // deployed with factory contract
    if (!resTx[0]) {
      if (!(await this.provider.traceTransaction(blockWithTransactions.transactions[0].hash))) {
        throw new Error(`
        !!! This contract deployed with factory contract 
        But this node doesn't support trace_transaction
        Query yourself in block ${blockNumber}
        `);
        //
      } else {
        const promises = blockWithTransactions.transactions.map(async (tx: any) => {
          const traces = await this.provider.traceTransaction(tx.hash);
          for (const trace of traces) {
            if (trace.result.address && trace.result.address === contractAddress.toLowerCase()) {
              deployedBy = `Factory Contract(${trace.action.creationMethod}): ${getChecksumAddress(
                trace.action.from
              )}`;
              return tx;
            }
          }
        });
        resTx = (await Promise.all(promises)).filter((el) => el);
      }
    }

    return { ...resTx[0], deployedBy };
  }

  private async _isContractExistBlock(
    contractAddress: string,
    blockNumber: number
  ): Promise<boolean> {
    const contractByteCode = await this.provider.getCode(contractAddress, blockNumber);
    return contractByteCode === "0x" ? false : true;
  }
}
