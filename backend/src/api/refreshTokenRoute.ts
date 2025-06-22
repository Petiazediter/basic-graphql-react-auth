import { parse } from "cookie";
import { RequestHandler } from "express";
import { signAccessToken, verifyRefreshToken } from "../jwt";

export const refreshTokenPath: RequestHandler = async (req, res) => {
    let cookies = {}
    if ( req.headers.cookie ) {
      cookies = parse(req.headers.cookie);
    }

    const refreshToken = 'jid' in cookies ? cookies.jid : undefined;
    if ( !refreshToken ) {
      res.writeHead(401).end("No refresh token");
      return;
    }

    try {
      const verifiedPayload = verifyRefreshToken(refreshToken as string);
      if ( verifiedPayload ) {
        // TODO: check if userId is valid, refresh token is valid etc..
        const newAccessToken = signAccessToken(verifiedPayload, res);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ accessToken: newAccessToken }));
      }
    } catch (error) {
      console.error(error)
      res.writeHead(403).end("Invalid Refresh Token");
    }
}
