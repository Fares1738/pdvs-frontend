// // "use client";

// import styles from "../../../styles/page.module.css";
// import NavBar from "@/components/NavBar";
// import { Box, Button, List, TextField, Typography } from "@mui/material";
// import { useEffect, useState } from "react";
// import { SnapshotGraphQL } from "@/snapshot/graphql/SnapshotGraphQL";
// import { Proposal } from "@prisma/client";
// import { formatTime, isValidObjectId, stringify } from "@/utils/utils";
// import { getProposalLiked } from "../../../prisma/operations/proposals/put";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../../api/auth/[...nextauth]";
// import { getUserByAddress } from "../../../prisma/operations/users/read";
// import { getProposalById } from "../../../prisma/operations/proposals/read";
// import ProposalDisplay from "@/components/ProposalDisplay";
// import { useAccount } from "wagmi";
// import { SnapshotVoting } from "@/snapshot/SnapshotVoting";
// import { Hex } from "viem";
// import { CustomLoading } from "@/components/Loading";
// import RestrictedPage from "@/components/RestrictedPage";

// declare var window: any;

// export const getServerSideProps = async (ctx: any) => {
//   const { params, req, res } = ctx;
//   const { id } = params;
//   const isValidId = isValidObjectId(id);

//   let isLiked = false;
//   let isAdmin = false;
//   let proposal = null;
//   if (isValidId) proposal = await getProposalById(id as string);

//   const session = await getServerSession(req, res, await authOptions(req, res));

//   if (session?.address) {
//     const user = await getUserByAddress(session.address);
//     isAdmin = user?.userType === "ADMIN";
//     if (proposal && user) {
//       const result = await getProposalLiked(user.id, id);
//       isLiked = !!result;
//     }
//   }

//   // Pass data to the page via props
//   return {
//     props: {
//       _proposal: stringify(proposal as Object),
//       isLiked,
//       isAdmin,
//     },
//   };
// };

// type GraphProposal = {
//   created: number;
//   start: number;
//   end: number;
//   scores: number[];
//   scores_total: number;
// };

// type GraphVote = {
//   choice: number;
//   created: number;
//   vp: number;
// };

// export default function Proposals({
//   _proposal,
//   isLiked,
//   isAdmin,
// }: {
//   _proposal: any;
//   isLiked: boolean;
//   isAdmin: boolean;
// }) {
//   const snap = new SnapshotGraphQL();
//   const { address } = useAccount();
//   const [proposal, setProposal] = useState<Proposal>(JSON.parse(_proposal));
//   const [graphProposal, setGraphProposal] = useState<GraphProposal>();
//   const [graphVote, setGraphVote] = useState<GraphVote>();
//   const [reason, setReason] = useState("");
//   const [selected, setSelected] = useState(1);
//   const [vp, setVp] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const options = ["In Favor", "Against", "Abstain"];

//   async function getProposal() {
//     console.log("proposal id hash", proposal.proposalIdHash);
//     const proposalRes = await snap.getProposal(
//       proposal.proposalIdHash as string
//     );
//     if (proposalRes) {
//       setGraphProposal(proposalRes);
//     }
//     console.log("proposal snap", proposalRes);
//   }

//   async function getVote() {
//     if (address) {
//       const voteRes = await snap.getVote(
//         proposal.proposalIdHash as string,
//         address as string
//       );
//       if (voteRes.length > 0) {
//         const v = voteRes[0];
//         setSelected(v.choice);
//         setGraphVote(v);
//         console.log("graph vote", graphVote, v);
//       }
//       console.log("vote snap", voteRes);
//     }
//   }

//   async function getVotingPower() {
//     if (address) {
//       const voteRes = await snap.getVotingPower(
//         proposal.proposalIdHash as string,
//         address as string
//       );
//       if (voteRes) setVp(voteRes.vp);
//       console.log("voting power snap", voteRes);
//     }
//   }

//   useEffect(() => {
//     if (proposal && proposal.status === "Published") {
//       //
//       getProposal();
//       getVotingPower();
//       getVote().then(() => {
//         setLoading(false);
//       });
//     } else {
//       setLoading(false);
//     }
//   }, [address]);

//   const ProgressInfo = ({
//     percentage,
//     text,
//   }: {
//     percentage: number;
//     text: string;
//   }) => (
//     <>
//       <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//         <Typography>{text}</Typography>
//         <Typography>{`${percentage}%`}</Typography>
//       </Box>
//       <Box
//         sx={{ background: "blue", width: `${percentage}%`, height: 2 }}
//       ></Box>
//     </>
//   );

//   const [status, setStatus] = useState("");

//   useEffect(() => {
//     setInterval(() => {
//       const now = new Date().getTime() / 1000;
//       let _status = "";

//       if (!graphProposal) {
//         _status = "";
//       } else if (now < graphProposal.start) {
//         _status = "Starts " + formatTime(new Date(graphProposal.start * 1000));
//       } else if (now < graphProposal.end) {
//         _status = "Ends " + formatTime(new Date(graphProposal.end * 1000));
//       } else {
//         _status = "Voting has Ended";
//       }
//       setStatus(_status);
//     }, 5000);
//   }, []);

//   return (
//     <main>
//       <NavBar />
//       <Box className={styles.main}>
//         <RestrictedPage validAccess={!!proposal as boolean}>
//           <CustomLoading active={loading}>
//             <Box sx={{ display: "flex", flexDirection: "row" }}>
//               <Box sx={{ flex: 3 }}>
//                 <ProposalDisplay
//                   isCommentEnabled={false}
//                   comments={[]}
//                   isAdmin={isAdmin}
//                   isLiked={isLiked}
//                   proposal={proposal}
//                 />
//               </Box>
//               <Box sx={{ flex: 2, display: "flex", justifyContent: "center" }}>
//                 {/* <Typography>Voting Progress</Typography> */}
//                 <List
//                   sx={{
//                     width: "100%",
//                     p: 2,
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                   }}
//                 >
//                   <Typography mb={2}>Voting Progress</Typography>
//                   <List
//                     sx={{
//                       width: "100%",
//                       p: 1,
//                       display: "flex",
//                       flexDirection: "column",
//                       alignItems: "end-flex",
//                       mb: 2,
//                     }}
//                   >
//                     <Box
//                       mb={2}
//                       sx={{ display: "flex", justifyContent: "space-between" }}
//                     >
//                       <Typography>Snapshot Voting Power:</Typography>
//                       <Typography>{vp} VP</Typography>
//                     </Box>
//                     {options.map((o, i) => (
//                       <ProgressInfo
//                         key={i}
//                         text={o}
//                         percentage={
//                           !graphProposal || graphProposal?.scores_total === 0
//                             ? 0
//                             : Number(
//                                 (
//                                   (100 * graphProposal?.scores[i]) /
//                                   graphProposal?.scores_total
//                                 ).toFixed(2)
//                               )
//                         }
//                       />
//                     ))}
//                   </List>
//                   {options.map((o, i) => (
//                     <Button
//                       key={i}
//                       onClick={() => {
//                         setSelected(i + 1);
//                       }}
//                       sx={{
//                         color: "white",
//                         width: "100%",
//                         background: selected - 1 === i ? "black" : "gray",
//                         borderRadius: 3,
//                         mb: 1,
//                       }}
//                     >
//                       {o}
//                     </Button>
//                   ))}
//                   <TextField
//                     sx={{ width: "100%" }}
//                     multiline
//                     id="outlined-basic"
//                     label="Reason (Optional)"
//                     variant="outlined"
//                     value={reason}
//                     onChange={(e) => {
//                       setReason(e.target.value);
//                     }}
//                   />
//                   <Button
//                     onClick={() => {
//                       const snapVote = new SnapshotVoting(window.ethereum);
//                       try {
//                         const query = async () => {
//                           const res = await snapVote.vote(
//                             address as string,
//                             proposal.proposalIdHash as Hex,
//                             selected,
//                             reason !== "" ? reason : undefined
//                           );
//                           console.log("res vote", res);
//                         };
//                         query();
//                         // location.reload();
//                       } catch (e) {
//                         console.log("err vote", e);
//                       }
//                       // snap.propose({
//                       //   title: "Proposal 1: elect new members",
//                       //   body: "Lorem ipsum dolor sit amet, sea mazim insolens ei, vis sint volumus ullamcorper ex. Quo ne alienum eligendi similique. Amet alii pri et. Prima quaestio eleifend at pri, blandit perfecto menandri cu est. Cu cum nihil consetetur, consul mucius et eum, tibique adipisci ad pro. Erant doctus efficiendi et quo.",
//                       //   account: "0x17fBA9Eb71F040d57d19B48A28002FfE32380DF8",
//                       //   startTime: 1717073435,
//                       //   snapshotBlockHeight: 6006496,
//                       //   discussionLink: "https://www.google.com/",
//                       // });
//                     }}
//                     disabled={(() => {
//                       if (!graphProposal || !proposal) return true;
//                       const now = new Date().getTime() / 1000;
//                       return (
//                         proposal.status !== "Published" ||
//                         now < graphProposal?.start ||
//                         now > graphProposal?.end
//                       );
//                     })()}
//                     sx={{
//                       mt: 1,
//                       border: "3px black solid",
//                       color: "white",
//                       width: "100%",
//                       background: "blue",
//                       borderRadius: 3,
//                       mb: 2,
//                       "&.Mui-disabled": {
//                         color: "gray",
//                       },
//                     }}
//                   >
//                     VOTE
//                   </Button>
//                   {proposal.status !== "Published" && (
//                     <Typography sx={{ fontStyle: "italic" }}>
//                       **The proposal is still in the discussion phase**
//                     </Typography>
//                   )}
//                   <Typography sx={{ fontStyle: "italic" }}>{status}</Typography>
//                   {graphVote && (
//                     <Typography sx={{ fontStyle: "italic" }}>
//                       You have voted for {options[graphVote.choice - 1]}
//                     </Typography>
//                   )}
//                 </List>
//               </Box>
//             </Box>
//           </CustomLoading>
//         </RestrictedPage>
//       </Box>
//     </main>
//   );
// }
