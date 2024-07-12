import { Web3Provider, ExternalProvider } from "@ethersproject/providers";
import { appName, client, spaceName } from "./config";
import { Hex } from "viem";

export class SnapshotVoting {
  provider: ExternalProvider;

  constructor(_provider: ExternalProvider) {
    this.provider = _provider;
  }

  async vote(
    account: string,
    proposalHex: Hex,
    choice: number,
    message?: string
  ) {
    const web3 = new Web3Provider(this.provider);

    return await client.vote(web3, account, spaceName, {
      proposal: proposalHex,
      choice,
      metadata: { reason: message, app: appName, type: "single-choice" },
    });
  }




  async propose({
    title,
    body,
    account,
    startTime,
    snapshotBlockHeight,
    discussionLink,
  }: {
    title: string;
    body: string;
    account: string;
    discussionLink: string;
    startTime: number;
    snapshotBlockHeight: number;
  }) {
    const web3 = new Web3Provider(this.provider);
  
    const receipt = await client.proposal(web3, account, spaceName, {
      name: title,
      body: body,
      choices: ["In Favor", "Against", "Abstain"],
      start: startTime,
      end: startTime + 60 * 60 * 24 * 7, // Adjusted to use a direct calculation
      snapshot: snapshotBlockHeight,
      type: "single-choice",
      metadata: { discussion: discussionLink, plugins: JSON.stringify({}), app: appName },
    });
  
    return receipt;
  }
  
}
