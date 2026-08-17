export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
} as const;

export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
