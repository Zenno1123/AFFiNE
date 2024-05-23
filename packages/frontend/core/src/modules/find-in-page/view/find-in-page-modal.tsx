import { Button, Input, Modal } from '@affine/component';
import { rightSidebarWidthAtom } from '@affine/core/atoms';
import {
  ArrowDownSmallIcon,
  ArrowUpSmallIcon,
  SearchIcon,
} from '@blocksuite/icons';
import { useLiveData, useService } from '@toeverything/infra';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';
import { useAtomValue } from 'jotai';
import { useCallback, useDeferredValue, useEffect, useState } from 'react';

import { RightSidebarService } from '../../right-sidebar';
import { FindInPageService } from '../services/find-in-page';
import * as styles from './find-in-page-modal.css';
export const FindInPageModal = () => {
  const [value, setValue] = useState('');
  const deferredValue = useDeferredValue(value);
  const rightSidebarWidth = useAtomValue(rightSidebarWidthAtom);
  const findInPage = useService(FindInPageService).findInPage;
  const visible = useLiveData(findInPage.visible$);
  const result = useLiveData(findInPage.result$);
  const rightSidebar = useService(RightSidebarService).rightSidebar;
  const frontView = useLiveData(rightSidebar.front$);
  const open = useLiveData(rightSidebar.isOpen$) && frontView !== undefined;

  const handleSearch = useCallback(() => {
    findInPage.findInPage(deferredValue);
  }, [deferredValue, findInPage]);

  const handleBackWard = useCallback(() => {
    findInPage.backward();
  }, [findInPage]);

  const handleForward = useCallback(() => {
    findInPage.forward();
  }, [findInPage]);

  const onChangeVisible = useCallback(
    (visible: boolean) => {
      findInPage.stopFindInPage('clearSelection');
      findInPage.onChangeVisible(visible);
    },
    [findInPage]
  );
  const handleDone = useCallback(() => {
    onChangeVisible(false);
  }, [onChangeVisible]);

  useEffect(() => {
    const keyArrowDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        findInPage.forward();
      }
    };
    const keyArrowUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        findInPage.backward();
      }
    };
    document.addEventListener('keydown', keyArrowDown);
    document.addEventListener('keydown', keyArrowUp);
    return () => {
      document.removeEventListener('keydown', keyArrowDown);
      document.removeEventListener('keydown', keyArrowUp);
    };
  }, [findInPage]);

  const panelWidth = assignInlineVars({
    [styles.panelWidthVar]: open ? `${rightSidebarWidth}px` : '0',
  });

  return (
    <Modal
      open={visible}
      onOpenChange={onChangeVisible}
      overlayOptions={{
        hidden: true,
      }}
      withoutCloseButton
      width={398}
      height={48}
      minHeight={48}
      contentOptions={{
        className: styles.container,
        style: panelWidth,
      }}
    >
      <div className={styles.leftContent}>
        <Input
          defaultValue={value}
          onChange={setValue}
          onBlur={handleSearch}
          onEnter={handleSearch}
          preFix={<SearchIcon fontSize={20} />}
          endFix={
            result ? (
              <div className={styles.count}>
                {result.matches === 0 ? (
                  <span>No matches</span>
                ) : (
                  <>
                    <span>{result?.activeMatchOrdinal || 0}</span>
                    <span>/</span>
                    <span>{result?.matches || 0}</span>
                  </>
                )}
              </div>
            ) : null
          }
          style={{
            width: 239,
          }}
          className={styles.input}
          inputStyle={{ padding: '0' }}
        />

        <Button
          className={clsx(styles.arrowButton, 'backward')}
          onClick={handleBackWard}
        >
          <ArrowUpSmallIcon />
        </Button>
        <Button
          className={clsx(styles.arrowButton, 'forward')}
          onClick={handleForward}
        >
          <ArrowDownSmallIcon />
        </Button>
      </div>
      <Button type="primary" onClick={handleDone}>
        Done
      </Button>
    </Modal>
  );
};
