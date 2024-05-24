import {
  useLiveData,
  useService,
  type WorkspaceMetadata,
  WorkspacesService,
} from '@toeverything/infra';
import { useEffect, useLayoutEffect, useState } from 'react';

import { Avatar, type AvatarProps } from '../../ui/avatar';

const cache = new Map<
  string,
  { imageElement: HTMLImageElement; objectUrl: string; key: string }
>();

/**
 * workspace avatar component with automatic cache, and avoid flashing
 */
export const WorkspaceAvatar = ({
  meta,
  ...otherProps
}: { meta: WorkspaceMetadata } & AvatarProps) => {
  const workspacesService = useService(WorkspacesService);

  const profile = workspacesService.getProfile(meta);

  useEffect(() => {
    profile.revalidate();
  }, [meta, profile]);

  const avatarKey = useLiveData(profile.profile$.map(v => v?.avatar));

  const [downloadedAvatar, setDownloadedAvatar] = useState<
    | { imageElement: HTMLImageElement; objectUrl: string; key: string }
    | undefined
  >(cache.get(meta.id));

  useLayoutEffect(() => {
    if (!avatarKey || !meta) {
      setDownloadedAvatar(undefined);
      return;
    }

    let canceled = false;
    workspacesService
      .getWorkspaceBlob(meta, avatarKey)
      .then(async blob => {
        if (blob && !canceled) {
          const image = document.createElement('img');
          const objectUrl = URL.createObjectURL(blob);
          image.src = objectUrl;
          setDownloadedAvatar(prev => {
            if (prev?.key === avatarKey) {
              return prev;
            }
            return { imageElement: image, objectUrl, key: avatarKey };
          });
          cache.set(meta.id, {
            imageElement: image,
            objectUrl,
            key: avatarKey,
          });
        }
      })
      .catch(err => {
        console.error('get workspace blob error: ' + err);
      });

    return () => {
      canceled = true;
    };
  }, [meta, workspacesService, avatarKey]);

  return <Avatar image={downloadedAvatar?.imageElement} {...otherProps} />;
};
