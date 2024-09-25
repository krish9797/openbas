import React, { FunctionComponent, useState } from 'react';
import { Drawer as MuiDrawer, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import type { AssetGroupInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import Drawer from '../../../../components/common/Drawer';
import DialogDelete from '../../../../components/common/DialogDelete';
import type { AssetGroupStore } from './AssetGroup';
import { deleteAssetGroup, updateAssetGroup, updateAssetsOnAssetGroup } from '../../../../actions/asset_groups/assetgroup-action';
import AssetGroupForm from './AssetGroupForm';
import AssetGroupManagement from './AssetGroupManagement';
import Dialog from '../../../../components/common/Dialog';
import EndpointsDialogAdding from '../endpoints/EndpointsDialogAdding';
import { emptyFilterGroup } from '../../../../components/common/queryable/filter/FilterUtils';

const useStyles = makeStyles(() => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

interface Props {
  inline?: boolean;
  assetGroup: AssetGroupStore;
  onRemoveAssetGroupFromInject?: (assetGroupId: string) => void;
  onRemoveEndpointFromAssetGroup?: (assetId: string) => void;
  openEditOnInit?: boolean;
  onUpdate?: (result: AssetGroupStore) => void;
  onDelete?: (result: string) => void;
}

const AssetGroupPopover: FunctionComponent<Props> = ({
  inline,
  assetGroup,
  onRemoveAssetGroupFromInject,
  onRemoveEndpointFromAssetGroup,
  openEditOnInit = false,
  onUpdate,
  onDelete,

}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const initialValues = (({
    asset_group_name,
    asset_group_description,
    asset_group_tags,
    asset_group_dynamic_filter,
  }) => ({
    asset_group_name,
    asset_group_description: asset_group_description ?? '',
    asset_group_tags: asset_group_tags ?? [],
    asset_group_dynamic_filter: asset_group_dynamic_filter ?? emptyFilterGroup,
  }))(assetGroup);

  // Edition
  const [edition, setEdition] = useState(openEditOnInit);

  const handleEdit = () => {
    setEdition(true);
    setAnchorEl(null);
  };
  const submitEdit = (data: AssetGroupInput) => {
    dispatch(updateAssetGroup(assetGroup.asset_group_id, data)).then(
      (result: { result: string, entities: { asset_groups: Record<string, AssetGroupStore> } }) => {
        if (result.entities) {
          if (onUpdate) {
            const updated = result.entities.asset_groups[result.result];
            onUpdate(updated);
          }
        }
        setEdition(false);
        return result;
      },
    );
  };

  // Manage assets
  const [selected, setSelected] = useState<boolean>(false);

  const handleManage = () => {
    setSelected(true);
    setAnchorEl(null);
  };
  const sumitManage = (endpointIds: string[]) => {
    return dispatch(updateAssetsOnAssetGroup(assetGroup.asset_group_id, {
      asset_group_assets: endpointIds,
    }));
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => {
    setDeletion(true);
    setAnchorEl(null);
  };
  const submitDelete = () => {
    dispatch(deleteAssetGroup(assetGroup.asset_group_id)).then(
      () => {
        if (onDelete) {
          onDelete(assetGroup.asset_group_id);
        }
        setDeletion(false);
      },
    );
  };

  return (
    <>
      <IconButton
        color="primary"
        onClick={(ev) => {
          ev.stopPropagation();
          setAnchorEl(ev.currentTarget);
        }}
        aria-haspopup="true"
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEdit}>
          {t('Update')}
        </MenuItem>
        <MenuItem onClick={handleManage}>
          {t('Manage assets')}
        </MenuItem>
        {onRemoveAssetGroupFromInject && (
          <MenuItem onClick={() => onRemoveAssetGroupFromInject(assetGroup.asset_group_id)}>
            {t('Remove from the inject')}
          </MenuItem>
        )}
        <MenuItem
          onClick={handleDelete}
        >
          {t('Delete')}
        </MenuItem>
      </Menu>

      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={t('Do you want to delete the asset group ?')}
      />

      {inline ? (
        <Dialog
          open={edition}
          handleClose={() => setEdition(false)}
          title={t('Update the asset group')}
        >
          <AssetGroupForm
            initialValues={initialValues}
            editing={true}
            onSubmit={submitEdit}
            handleClose={() => setEdition(false)}
          />
        </Dialog>
      ) : (
        <Drawer
          open={edition}
          handleClose={() => setEdition(false)}
          title={t('Update the asset group')}
        >
          <AssetGroupForm
            initialValues={initialValues}
            editing={true}
            onSubmit={submitEdit}
            handleClose={() => setEdition(false)}
          />
        </Drawer>
      )}

      {inline ? (
        <>
          {selected !== undefined && (
            <EndpointsDialogAdding
              initialState={assetGroup.asset_group_assets ?? []} open={selected}
              onClose={() => setSelected(false)} onSubmit={sumitManage}
              title={t('Add assets in this asset group')}
            />
          )}
        </>
      ) : (
        <MuiDrawer
          open={selected}
          keepMounted={false}
          anchor="right"
          sx={{ zIndex: 1202 }}
          classes={{ paper: classes.drawerPaper }}
          onClose={() => setSelected(false)}
          elevation={1}
        >
          {selected !== undefined && (
            <AssetGroupManagement
              assetGroupId={assetGroup.asset_group_id}
              onUpdate={onUpdate}
              onRemoveEndpointFromAssetGroup={onRemoveEndpointFromAssetGroup}
              handleClose={() => setSelected(false)}
            />
          )}
        </MuiDrawer>
      )}
    </>
  );
};

export default AssetGroupPopover;
