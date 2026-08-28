export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
};

export type AuthSession = {
  patientId: string;
  tokens: AuthTokens;
};
