import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import {
  getUserByAddress,
  getUserById,
} from "../../../prisma/operations/users/read";
import { getProposalById } from "../../../prisma/operations/proposals/read";
import { getProposalComments } from "../../../prisma/operations/comments/read";
//import { Comment } from "@prisma/client";
import { CustomComment } from "@/utils/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    message: string;
    data: Object;
  }>
) {
  const { method, query } = req;
  const { proposalId } = query;

  const session = await getServerSession(req, res, await authOptions(req, res));

  if (method === "GET") {
    try {
      let comments: Comment[] = [];
      const p = await getProposalById(proposalId as string);
      // if (p) {
      //   comments = await getProposalComments(p.id);
      // }

      const comments1: CustomComment[] = [];

      // for (const c of comments) {
      //   const c1: CustomComment = c as CustomComment;
      //   const u = await getUserById(c.authorId);
      //   c1.username = u ? u.fullName : "";
      //   c1.userType = u ? u.userType : "";
      //   const address = session?.address;
      //   if (address) {
      //     const u = await getUserByAddress(address);
      //     if (u) c1.isEditable = c1.authorId === u.id;
      //     else c1.isEditable = false;
      //   } else {
      //     c1.isEditable = false;
      //   }
      //   comments1.push(c1);
      // }

      return res
        .status(200)
        .json({ message: "success", data: { comments: comments1 } });
    } catch (e) {
      console.log("error", e);
      return res
        .status(500)
        .json({ message: "Something went wrong!", data: {} });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed!", data: {} });
  }
}
