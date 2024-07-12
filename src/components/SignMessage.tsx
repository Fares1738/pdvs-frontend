import * as React from "react";
import { useSignMessage } from "wagmi";
import { recoverMessageAddress, SignableMessage } from "viem";

export function SignMessage() {
  //   const recoveredAddress = React.useRef<string>();
  const {
    data: signMessageData,
    error,
    isPending,
    signMessage,
    variables,
  } = useSignMessage();
  const [recoveredAddress, setRecoveredAddress] = React.useState("");

  React.useEffect(() => {
    (async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        });
        setRecoveredAddress(recoveredAddress);
      }
    })();
  }, [signMessageData, variables?.message]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.target as HTMLFormElement);
        const message = formData.get("message");
        signMessage({ message: message as SignableMessage });
      }}
    >
      <label htmlFor="message">Enter a message to sign</label>
      <textarea
        id="message"
        name="message"
        placeholder="The quick brown fox…"
      />
      <button disabled={isPending}>
        {isPending ? "Check Wallet" : "Sign Message"}
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
