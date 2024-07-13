// "use client";

import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EditIcon from "@mui/icons-material/Edit";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import { Proposal } from "@prisma/client";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { performBriefPOST, performPOST } from "@/utils/httpRequest";

import {
  activeClient,
  formatTime,
  getProposalColor,
  getUserTypeColor,
} from "@/utils/utils";
import SaveAsIcon from "@mui/icons-material/SaveAs";
import Link from "next/link";
import { SnapshotVoting } from "@/snapshot/SnapshotVoting";
import { CustomComment } from "@/utils/types";
import { useAccount } from "wagmi";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

declare var window: any;

const ProposalDisplay = ({
  proposal,
  comments,
  isLiked,
  isAdmin,
  isCommentEnabled,
}: {
  proposal: Proposal;
  comments: CustomComment[];
  isLiked: boolean;
  isAdmin: boolean;
  isCommentEnabled: boolean;
}) => {
  const { address } = useAccount();
  const { isAuth } = useAuth();
  const { isAdminOrCM } = useUser();

  const isEditable = (createdAt: Date) => {
    const expirationAtTime = new Date(createdAt).getTime() + 10 * 60 * 1000;
    const now = new Date().getTime();
    return now <= expirationAtTime;
  };

  const ProposalDetails = () => {
    const [liked, setLiked] = useState(isLiked);

    const submitLike = async () => {
      await performBriefPOST(
        "/api/proposals/like",
        JSON.stringify({
          proposalId: proposal.id,
        }),
        "like proposal"
      );
    };

    const Like = () => (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          alignContent: "center",
        }}
      >
        <IconButton
          sx={{
            p: 0,
          }}
          onClick={async () => {
            if (isAuth) {
              setLiked(!liked);
              await submitLike();
            }
          }}
          disableRipple
        >
          {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography mb={1}>
          {isLiked
            ? proposal.likesCount - (liked ? 0 : 1)
            : proposal.likesCount + (liked ? 1 : 0)}
        </Typography>
      </Box>
    );
    const [comment, setComment] = useState("");
    const submit = async () => {
      const obj = {
        proposalId: proposal.id,
        content: comment,
      };

      await performPOST(
        "/api/comments/create",
        JSON.stringify(obj),
        (res: any) => {
          console.log("create comment res:", res);
          location.reload();
        },
        (err: any) => {
          console.log("create comment err:", err);
        }
      );
    };

    const [commentIdEditing, setCommentIdEditing] = useState("");
    const [commentContentEditing, setCommentContentEditing] = useState("");

    const saveSubmit = async () => {
      const obj = {
        commentId: commentIdEditing,
        content: commentContentEditing,
      };

      await performPOST(
        "/api/comments/edit",
        JSON.stringify(obj),
        (res: any) => {
          console.log("edit comment res:", res);
          location.reload();
        },
        (err: any) => {
          console.log("edit comment err:", err);
        }
      );
    };

    return (
      <>
        <Box sx={{ border: "black solid 3px", borderRadius: 3, p: 2, mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Typography mb={2} variant="h4">
              {proposal.title}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
              }}
            >
              <Like />

              {/* <IconButton
                href={
                  "https://testnet.snapshot.org/#/persaka.eth/proposal/" +
                  proposal.proposalIdHash
                }
                target="_blank"
              >
                <OpenInNewIcon />
              </IconButton> */}

              <Typography
                sx={{
                  color: "white",
                  background: getProposalColor(proposal.status),
                  p: 0.5,
                  borderRadius: 2,
                  ml: 1,
                }}
              >
                {proposal.status}
              </Typography>
            </Box>
          </Box>
          {!!proposal.blockNumberSnapshot && (
            <Typography mb={2} variant="subtitle2">
              Block Snapshot at{" "}
              <Link
                href={
                  "https://testnet.bscscan.com/block/" +
                  Number(proposal.blockNumberSnapshot)
                }
              >
                {Number(proposal.blockNumberSnapshot)}
              </Link>
            </Typography>
          )}
          <Typography mb={2} variant="body2">
            {proposal.content}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography mb={2} variant="body2">
              {formatTime(new Date(proposal.createdAt))}
            </Typography>
            <Box>
              {proposal.status === "Published" && (
                <Button
                  sx={{
                    color: "black",
                    border: "3px black solid",
                    borderRadius: 2,
                    mr: 0.5,
                  }}
                  href={"/proposals/vote/" + proposal.id}
                >
                  Vote
                </Button>
              )}
              {isAuth && isAdminOrCM && (
                <Button
                  sx={{
                    color: "black",
                    border: "3px black solid",
                    borderRadius: 2,
                    mr: 0.5,
                  }}
                  href={"/proposals/edit/" + proposal.id}
                >
                  Edit
                </Button>
              )}
              {isAdmin && proposal.status !== "Published" && (
                <Button
                  sx={{
                    color: "black",
                    border: "3px black solid",
                    borderRadius: 2,
                  }}
                  onClick={() => {
                    async function submitButton() {
                      try {
                        const obj: any = {
                          proposalId: proposal.id,
                        };
                        if (proposal.status === "Active") {
                          const snap = new SnapshotVoting(window.ethereum);

                          const c = await activeClient.getBlock({
                            blockTag: "latest",
                          });

                          console.log("c", c);

                          // TODO change period until start from 1 min to 1 hour
                          const res = await snap.propose({
                            title: proposal.title,
                            body: proposal.content,
                            account: address as string,
                            startTime: Math.floor(Number(c.timestamp) + 60),
                            snapshotBlockHeight: Number(c.number),
                            discussionLink: "https://www.google.com/",
                          });

                          obj.action = "publish";
                          obj.proposalDigest = res;
                          console.log("proposal res", res);
                        } else {
                          obj.action = "activate";
                        }

                        await performPOST(
                          "/api/proposals/edit",
                          JSON.stringify(obj),
                          (res: any) => {
                            console.log("edit proposal res:", res);
                            location.reload();
                          },
                          (err: any) => {
                            console.log("edit proposal err:", err);
                          }
                        );
                      } catch (err) {
                        console.log("proposal err", err);
                      }
                    }
                    submitButton();
                  }}
                >
                  {proposal.status === "Draft" ? "Activate" : "Publish"}
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Comment Section */}
        {isCommentEnabled && (
          <Box>
            {proposal.status === "Active" && (
              <TextField
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={submit}>
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mt: 2,
                  width: "640px",
                  mb: 2,
                }}
                multiline
                id="outlined-basic"
                label="Comment"
                variant="outlined"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
              />
            )}
            <Typography>Comments</Typography>
            <List>
              {comments.map((c, i) => (
                <ListItem
                  sx={{ border: "3px black solid", borderRadius: 3, mb: 2 }}
                  key={i}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      width: 600,
                      minHeight: 150,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "row",
                      }}
                    >
                      <Typography variant="h6">{c.username}</Typography>
                      <Typography
                        variant="subtitle2"
                        ml={1}
                        sx={{
                          background: () => {
                            return getUserTypeColor(c.userType);
                          },
                          borderRadius: 3,
                          p: "2px 4px",
                          color: "white",
                        }}
                      >
                        {c.userType}
                      </Typography>
                    </Box>
                    {c.id !== commentIdEditing ? (
                      <Typography
                        sx={{ display: "inline-flex", p: 1 }}
                        variant="body2"
                      >
                        {c.content}
                      </Typography>
                    ) : (
                      <TextField
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => {
                                  saveSubmit();
                                  setCommentIdEditing("");
                                  setCommentContentEditing("");
                                }}
                              >
                                <SaveAsIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          mt: 2,
                          width: "auto",
                          mb: 2,
                        }}
                        multiline
                        id="outlined-basic"
                        label="Comment"
                        variant="outlined"
                        value={commentContentEditing}
                        onChange={(e) => {
                          setCommentContentEditing(e.target.value);
                        }}
                      />
                    )}
                    <Typography
                      sx={{ position: "absolute", bottom: 0, right: 0, p: 2 }}
                      variant="body2"
                    >
                      {formatTime(new Date(c.createdAt))}
                    </Typography>

                    <Box sx={{ position: "absolute", top: 0, right: 0, p: 2 }}>
                      {/* Actions */}
                      {c.isEditable && isEditable(c.createdAt) && (
                        <IconButton
                          onClick={() => {
                            setCommentIdEditing(c.id);
                            setCommentContentEditing(c.content);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {isAdmin && (
                        <IconButton
                          disableRipple
                          onClick={async () => {
                            const obj = { commentId: c.id };
                            await performPOST(
                              "/api/comments/delete",
                              JSON.stringify(obj),
                              (res: any) => {
                                console.log("delete comment res:", res);
                                location.reload();
                              },
                              (err: any) => {
                                console.log("delete comment err:", err);
                              }
                            );
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </>
    );
  };

  const NoProposal = () => {
    return <Typography>No Proposal Found</Typography>;
  };

  return proposal ? <ProposalDetails /> : <NoProposal />;
};
export default ProposalDisplay;
