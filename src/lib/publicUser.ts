export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export type UserWithPasswordHash = PublicUser & { passwordHash: string };

export function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
