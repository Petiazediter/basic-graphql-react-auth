import { parse } from "cookie";
import { RequestHandler } from "express";
import { JWTToken, signAccessToken, verifyRefreshToken } from "../jwt";
import _ from "lodash";

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
    const verifiedPayload: JWTToken | null = verifyRefreshToken(refreshToken as string);
    if ( verifiedPayload ) {
      const strippedPayload = _.omit(verifiedPayload, ['iat', 'exp']) as JWTToken;
      const newAccessToken = signAccessToken(strippedPayload, res);
      res.status(200).json({ accessToken: newAccessToken });
    } else {
      res.status(403).json({ error: "Invalid refresh token" });
    }
  } catch (error) {
    res.status(403).json({ error: "Invalid Refresh Token" });
  }
}
