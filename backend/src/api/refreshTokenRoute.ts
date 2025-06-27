import { parse } from "cookie";
import { RequestHandler } from "express";
import { JWTToken, signAccessToken, verifyRefreshToken } from "../jwt";

export const refreshTokenPath: RequestHandler = async (req, res) => {
  let cookies = {}
  if ( req.headers.cookie ) {
    cookies = parse(req.headers.cookie);
  }

  const refreshToken = 'jid' in cookies ? cookies.jid : undefined;
  if ( !refreshToken ) {
    res.status(401).json({ error: "No refresh token" });
    return;
  }

  try {
    const verifiedPayload = verifyRefreshToken(refreshToken as string);
    if ( verifiedPayload ) {
      // TODO: check if userId is valid, refresh token is valid etc..
      const payloadToSend: JWTToken = {
        userId: verifiedPayload.userId,
      }
      const newAccessToken = signAccessToken(payloadToSend, res);
      res.status(200).json({ accessToken: newAccessToken });
      // res.end(JSON.stringify({ accessToken: newAccessToken }));
    } else {
      res.status(403).json({ error: "Invalid refresh token" });
    }
  } catch (error) {
    res.status(403).json({ error: "Invalid Refresh Token" });
  }
}
