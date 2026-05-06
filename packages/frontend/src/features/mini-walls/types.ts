export type MiniWall = {
  id: string;
  wallId: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
};

export type CreateMiniWallInput = {
  wall_id: string;
  name: string;
  slug: string;
  description: string;
};

export type UpdateMiniWallInput = {
  name?: string;
  slug?: string;
  description?: string;
};
