import { prisma } from '../config/prisma.js';

export async function cleanupExpiredAuthRecords(now = new Date(), retentionDays = 30) {
  const retentionCutoff = new Date(now.getTime() - retentionDays * 86_400_000);
  const [refreshTokens, passwordResetTokens] = await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { revokedAt: { lt: retentionCutoff } }] } }),
    prisma.passwordResetToken.deleteMany({ where: { OR: [{ expiresAt: { lt: now } }, { usedAt: { lt: retentionCutoff } }] } }),
  ]);
  return { refreshTokensDeleted: refreshTokens.count, passwordResetTokensDeleted: passwordResetTokens.count };
}
