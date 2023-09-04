export class CustomRpcProvider {
  constructor(private readonly end_point: string) {}

  /**
   *
   * @param address
   * @param blockTag default "latest"
   * @returns The code from the given address
   */
  async getCode(address: string, blockTag: number | string = "latest"): Promise<string> {
    if (typeof blockTag === "number") blockTag = "0x" + blockTag.toString(16);

    const method = "eth_getCode";
    const params = [address.toLowerCase(), blockTag];

    return await this._fetch(method, params);
  }

  /**
   *
   * @param blockTag default "latest"
   * @param withFullTxs When it true returns all txns objects, when it false returns only txns hashes
   * @returns A block object, or null when no block was found
   */
  async getBlockByNumber(
    blockTag: number | string = "latest",
    withFullTxs: boolean
  ): Promise<any | null> {
    if (typeof blockTag === "number") blockTag = "0x" + blockTag.toString(16);

    const method = "eth_getBlockByNumber";
    const params = [blockTag, withFullTxs];

    return await this._fetch(method, params);
  }

  /**
   *
   * @param txHash
   * @returns A transaction receipt object or null when no receipt was found
   */
  async getTransactionReceipt(txHash: string): Promise<any | null> {
    const method = "eth_getTransactionReceipt";
    const params = [txHash];

    const ret = await this._fetch(method, params);
    // console.log(ret);
    return ret;
  }

  /**
   *
   * @param txHash
   * @returns list of calls to other contracts containing one object per call, in the order called by the transaction
   */
  async traceTransation(txHash: string): Promise<any[]> {
    const method = "trace_transaction";
    const params = [txHash];

    return await this._fetch(method, params);
  }

  /**
   *
   * @returns integer of the current block number the client is on
   */
  async blockNumber(): Promise<number> {
    const method = "eth_blockNumber";

    return parseInt(await this._fetch(method), 16);
  }

  private async _fetch(method: string, params: any[] = []) {
    const res = await fetch(this.end_point, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method,
        params,
        id: 1,
      }),
    });

    return (await res.json()).result;
  }
}
