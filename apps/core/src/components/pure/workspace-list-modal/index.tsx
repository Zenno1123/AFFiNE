import { Menu, MenuItem } from '@affine/component';
import { WorkspaceList } from '@affine/component/workspace-list';
import type {
  AffineCloudWorkspace,
  LocalWorkspace,
} from '@affine/env/workspace';
import { WorkspaceFlavour } from '@affine/env/workspace';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import type { RootWorkspaceMetadata } from '@affine/workspace/atom';
import {
  CloudWorkspaceIcon,
  ImportIcon,
  MoreHorizontalIcon,
  PlusIcon,
} from '@blocksuite/icons';
import type { DragEndEvent } from '@dnd-kit/core';
import { Popover } from '@mui/material';
import { IconButton } from '@toeverything/components/button';
import { Divider } from '@toeverything/components/divider';
import { useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { openDisableCloudAlertModalAtom } from '../../../atoms';
import type { AllWorkspace } from '../../../shared';
import {
  StyledCreateWorkspaceCardPill,
  StyledCreateWorkspaceCardPillContent,
  StyledCreateWorkspaceCardPillIcon,
  StyledImportWorkspaceCardPill,
  StyledModalBody,
  StyledModalContent,
  StyledModalFooterContent,
  StyledModalHeader,
  StyledModalHeaderContent,
  StyledModalHeaderLeft,
  StyledModalTitle,
  StyledOperationWrapper,
  StyledSignInCardPill,
  StyledSignInCardPillTextCotainer,
  StyledSignInCardPillTextPrimary,
  StyledSignInCardPillTextSecondary,
} from './styles';

interface WorkspaceModalProps {
  disabled?: boolean;
  workspaces: RootWorkspaceMetadata[];
  currentWorkspaceId: AllWorkspace['id'] | null;
  open: boolean;
  onClose: () => void;
  onClickWorkspace: (workspace: RootWorkspaceMetadata['id']) => void;
  onClickWorkspaceSetting: (workspace: RootWorkspaceMetadata['id']) => void;
  onNewWorkspace: () => void;
  onAddWorkspace: () => void;
  onMoveWorkspace: (activeId: string, overId: string) => void;
}

const AccountMenu = () => {
  const t = useAFFiNEI18N();
  return (
    <div>
      <div>Unlimted</div>
      <Divider size="thinner" dividerColor="var(--affine-border-color)" />
      <MenuItem icon={<ImportIcon />} data-testid="editor-option-menu-import">
        {t['com.affine.workspace.cloud.join']()}
      </MenuItem>
      <MenuItem icon={<ImportIcon />} data-testid="editor-option-menu-import">
        {t['com.affine.workspace.cloud.account.settings']()}
      </MenuItem>
      <Divider size="thinner" dividerColor="var(--affine-border-color)" />
      <MenuItem icon={<ImportIcon />} data-testid="editor-option-menu-import">
        {t['com.affine.workspace.cloud.account.logout']()}
      </MenuItem>
    </div>
  );
};

const CloudWorkSpaceList = ({
  disabled,
  workspaces,
  onClickWorkspace,
  onClickWorkspaceSetting,
  currentWorkspaceId,
  onMoveWorkspace,
}: WorkspaceModalProps) => {
  const t = useAFFiNEI18N();

  return (
    <>
      <StyledModalHeader>
        <StyledModalHeaderLeft>
          <StyledModalTitle>
            {t['com.affine.workspace.cloud.sync']()}
          </StyledModalTitle>
        </StyledModalHeaderLeft>

        <StyledOperationWrapper>
          <Menu
            placement="bottom-end"
            trigger={['click']}
            content={<AccountMenu />}
            zIndex={1000}
          >
            <IconButton
              data-testid="previous-image-button"
              icon={<MoreHorizontalIcon />}
              type="plain"
            />
          </Menu>
        </StyledOperationWrapper>
      </StyledModalHeader>
      <StyledModalContent>
        <WorkspaceList
          disabled={disabled}
          items={
            workspaces.filter(
              ({ flavour }) => flavour !== WorkspaceFlavour.PUBLIC
            ) as (AffineCloudWorkspace | LocalWorkspace)[]
          }
          currentWorkspaceId={currentWorkspaceId}
          onClick={onClickWorkspace}
          onSettingClick={onClickWorkspaceSetting}
          onDragEnd={useCallback(
            (event: DragEndEvent) => {
              const { active, over } = event;
              if (active.id !== over?.id) {
                onMoveWorkspace(active.id as string, over?.id as string);
              }
            },
            [onMoveWorkspace]
          )}
        />
        <Divider size="thinner" dividerColor="var(--affine-border-color)" />
      </StyledModalContent>
    </>
  );
};

export const WorkspaceListModal = ({
  disabled,
  open,
  onClose,
  workspaces,
  onClickWorkspace,
  onClickWorkspaceSetting,
  onNewWorkspace,
  onAddWorkspace,
  currentWorkspaceId,
  onMoveWorkspace,
}: WorkspaceModalProps) => {
  const t = useAFFiNEI18N();
  const setOpen = useSetAtom(openDisableCloudAlertModalAtom);
  // TODO: AFFiNE Cloud support
  const isLoggedIn = false;
  const anchorEl = document.getElementById('current-workspace');

  return (
    <Popover
      sx={{
        color: 'success.main',
        zIndex: 999,
        '& .MuiPopover-paper': {
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--affine-shadow-2)',
          backgroundColor: 'var(--affine-background-overlay-panel-color)',
        },
        maxHeight: '90vh',
      }}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
    >
      <StyledModalHeaderContent>
        <StyledSignInCardPill>
          <MenuItem
            style={{
              height: 'auto',
              padding: '8px 12px',
            }}
            onClick={async () => {
              if (!runtimeConfig.enableCloud) {
                setOpen(true);
              }
            }}
            data-testid="cloud-signin-button"
          >
            <StyledCreateWorkspaceCardPillContent>
              <StyledCreateWorkspaceCardPillIcon>
                <CloudWorkspaceIcon />
              </StyledCreateWorkspaceCardPillIcon>
              <StyledSignInCardPillTextCotainer>
                <StyledSignInCardPillTextPrimary>
                  {t['com.affine.workspace.cloud.auth']()}
                </StyledSignInCardPillTextPrimary>
                <StyledSignInCardPillTextSecondary>
                  Sync with AFFiNE Cloud
                </StyledSignInCardPillTextSecondary>
              </StyledSignInCardPillTextCotainer>
            </StyledCreateWorkspaceCardPillContent>
          </MenuItem>
        </StyledSignInCardPill>
        <Divider size="thinner" dividerColor="var(--affine-border-color)" />
      </StyledModalHeaderContent>
      <StyledModalBody>
        {isLoggedIn ? (
          <CloudWorkSpaceList
            disabled={disabled}
            open={open}
            onClose={onClose}
            workspaces={workspaces}
            onClickWorkspace={onClickWorkspace}
            onClickWorkspaceSetting={onClickWorkspaceSetting}
            onNewWorkspace={onNewWorkspace}
            onAddWorkspace={onAddWorkspace}
            currentWorkspaceId={currentWorkspaceId}
            onMoveWorkspace={onMoveWorkspace}
          />
        ) : null}
        <StyledModalHeader>
          <StyledModalTitle>{t['Local Workspace']()}</StyledModalTitle>
        </StyledModalHeader>
        <StyledModalContent>
          <WorkspaceList
            disabled={disabled}
            items={
              workspaces.filter(
                ({ flavour }) => flavour !== WorkspaceFlavour.PUBLIC
              ) as (AffineCloudWorkspace | LocalWorkspace)[]
            }
            currentWorkspaceId={currentWorkspaceId}
            onClick={onClickWorkspace}
            onSettingClick={onClickWorkspaceSetting}
            onDragEnd={useCallback(
              (event: DragEndEvent) => {
                const { active, over } = event;
                if (active.id !== over?.id) {
                  onMoveWorkspace(active.id as string, over?.id as string);
                }
              },
              [onMoveWorkspace]
            )}
          />
        </StyledModalContent>
        {runtimeConfig.enableSQLiteProvider && environment.isDesktop ? (
          <StyledImportWorkspaceCardPill>
            <MenuItem
              onClick={onAddWorkspace}
              data-testid="add-workspace"
              style={{
                height: 'auto',
                padding: '8px 12px',
              }}
            >
              <StyledCreateWorkspaceCardPillContent>
                <StyledCreateWorkspaceCardPillIcon>
                  <ImportIcon />
                </StyledCreateWorkspaceCardPillIcon>
                <div>
                  <p>{t['com.affine.workspace.local.import']()}</p>
                </div>
              </StyledCreateWorkspaceCardPillContent>
            </MenuItem>
          </StyledImportWorkspaceCardPill>
        ) : null}
      </StyledModalBody>
      <StyledModalFooterContent>
        <StyledCreateWorkspaceCardPill>
          <MenuItem
            style={{
              height: 'auto',
              padding: '8px 12px',
            }}
            onClick={onNewWorkspace}
            data-testid="new-workspace"
          >
            <StyledCreateWorkspaceCardPillContent>
              <StyledCreateWorkspaceCardPillIcon>
                <PlusIcon />
              </StyledCreateWorkspaceCardPillIcon>
              <div>
                <p>{t['New Workspace']()}</p>
              </div>
            </StyledCreateWorkspaceCardPillContent>
          </MenuItem>
        </StyledCreateWorkspaceCardPill>
      </StyledModalFooterContent>
    </Popover>
  );
};