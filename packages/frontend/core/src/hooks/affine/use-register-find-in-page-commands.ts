import { useDocMetaHelper } from '@affine/core/hooks/use-block-suite-page-meta';
import { FindInPageService } from '@affine/core/modules/find-in-page/services/find-in-page';
import { assertExists } from '@blocksuite/global/utils';
import {
  DocService,
  PreconditionStrategy,
  registerAffineCommand,
  useService,
  WorkspaceService,
} from '@toeverything/infra';
import { useCallback, useEffect } from 'react';

export function useRegisterFindInPageCommands() {
  const doc = useService(DocService).doc;
  const docId = doc.id;

  const workspace = useService(WorkspaceService).workspace;
  const docCollection = workspace.docCollection;
  const { getDocMeta } = useDocMetaHelper(docCollection);
  const currentPage = docCollection.getDoc(docId);
  assertExists(currentPage);
  const pageMeta = getDocMeta(docId);
  assertExists(pageMeta);
  const trash = pageMeta.trash ?? false;

  const findInPage = useService(FindInPageService).findInPage;
  const toggleVisible = useCallback(() => {
    findInPage.toggleVisible();
  }, [findInPage]);

  useEffect(() => {
    if (!environment.isDesktop) {
      return;
    }
    const unsubs: Array<() => void> = [];
    unsubs.push(
      registerAffineCommand({
        id: `editor:find-in-page`,
        preconditionStrategy: () => {
          return PreconditionStrategy.InPaperOrEdgeless && !trash;
        },
        keyBinding: {
          binding: '$mod+f',
        },
        icon: null,
        label: '',
        run() {
          toggleVisible();
        },
      })
    );

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [toggleVisible, trash]);
}
