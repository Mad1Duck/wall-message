import { useQuery } from '@tanstack/react-query';
import { wallsApi, wallKeys } from '../api/walls.api';

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function useCheckUsername(username: string, enabled = true) {
  return useQuery({
    queryKey: wallKeys.checkUsername(username),
    queryFn: () => wallsApi.checkUsername(username),
    enabled: enabled && USERNAME_REGEX.test(username),
    retry: 0,
  });
}
