import * as React from "react";
import { useSignMessage } from "wagmi";
import { recoverMessageAddress, SignableMessage } from "viem";

export function SignMessage() {
  const {
    data: signMessageData,
    error,
    isPending,
    signMessage,
    variables,
  } = useSignMessage();
  const [recoveredAddress, setRecoveredAddress] = React.useState("");

  React.useEffect(() => {
    const fetchRecoveredAddress = async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddr = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        });
        setRecoveredAddress(recoveredAddr);
      }
    };

    fetchRecoveredAddress();
  }, [signMessageData, variables?.message]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const message = formData.get("message") as SignableMessage;
    signMessage({ message });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="message">Enter a message to sign</label>
      <textarea
        id="message"
        name="message"
        placeholder="The quick brown fox…"
      />
      <button disabled={isPending}>
        {isPending ? "Checking Wallet" : "Sign Message"}
      </button>

      {signMessageData && (
        <div>
          <div>Recovered Address: {recoveredAddress}</div>
          <div>Signature: {signMessageData}</div>
        </div>
      )}

      {error && <div>{error.message}</div>}
    </form>
  );
}
