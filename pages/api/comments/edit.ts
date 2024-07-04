import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { getUserByAddress } from "../../../prisma/operations/users/read";
import { updateComment } from "../../../prisma/operations/comments/put";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{
    message: string;
  }>
) {
  const { method, body } = req;
  const { commentId, content } = body;

  async function session() {
    try {
      const session = await getServerSession(
        req,
        res,
        await authOptions(req, res)
      );
      if (session) {
        const u = await getUserByAddress(session.address);
        await updateComment(u ? u.id : "", commentId, content);

        return res.status(200).json({ message: "success" });
      } else {
        return res.status(401).json({ message: "Invalid Session!" });
      }
    } catch (e) {
      console.log("error", e);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  }

  if (method === "POST") {
    session();
  } else {
    return res.status(405).json({ message: "Method Not Allowed!" });
  }
}
