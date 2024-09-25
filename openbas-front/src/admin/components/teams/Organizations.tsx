import React, { CSSProperties } from 'react';
import { makeStyles } from '@mui/styles';
import { IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Tooltip } from '@mui/material';
import { CSVLink } from 'react-csv';
import { DomainOutlined, FileDownloadOutlined } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import { useFormatter } from '../../../components/i18n';
import { fetchOrganizations } from '../../../actions/Organization';
import ItemTags from '../../../components/ItemTags';
import { truncate } from '../../../utils/String';
import CreateOrganization from './organizations/CreateOrganization';
import OrganizationPopover from './organizations/OrganizationPopover';
import { fetchTags } from '../../../actions/Tag';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../common/filters/TagsFilter';
import { exportData } from '../../../utils/Environment';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useAppDispatch } from '../../../utils/hooks';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../store';
import type { OrganizationHelper, TagHelper, UserHelper } from '../../../actions/helper';
import type { Theme } from '../../../components/Theme';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import type { Organization } from '../../../utils/api-types';

const useStyles = makeStyles((theme: Theme) => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  container: {
    display: 'flex',
  },
  itemHead: {
    textTransform: 'uppercase',
    cursor: 'pointer',
    paddingLeft: 10,
  },
  item: {
    height: 50,
  },
  bodyItem: {
    fontSize: theme.typography.h3.fontSize,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  downloadButton: {
    marginRight: 15,
  },
}));

const inlineStylesHeaders: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  organization_name: {
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  organization_description: {
    width: '40%',
    fontSize: 12,
    fontWeight: '700',
  },
  organization_tags: {
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  organization_name: {
    width: '30%',
  },
  organization_description: {
    width: '40%',
  },
  organization_tags: {
    width: '30%',
  },
};

const Organizations = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const { t } = useFormatter();

  // Fetching data
  const { organizations, tagsMap, userAdmin } = useHelper((helper: UserHelper & TagHelper & OrganizationHelper) => ({
    organizations: helper.getOrganizations(),
    tagsMap: helper.getTagsMap(),
    userAdmin: helper.getMe()?.user_admin,
  }));

  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
  });

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Filter and sort hook
  const filtering = useSearchAnFilter(
    'organization',
    'name',
    [
      'name',
      'description',
    ],
    { defaultKeyword: search },
  );

  const sortedOrganizations: Organization[] = filtering.filterAndSort(organizations);

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Teams') }, { label: t('Organizations'), current: true }]} />
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
            tagsFetched
          />
        </div>
        <div className={classes.downloadButton}>
          {sortedOrganizations.length > 0 ? (
            <CSVLink
              data={exportData(
                'organization',
                [
                  'organization_name',
                  'organization_description',
                  'organization_tags',
                ],
                sortedOrganizations,
                tagsMap,
              )}
              filename={`${t('Organizations')}.csv`}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary" />
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled>
              <FileDownloadOutlined />
            </IconButton>
          )}
        </div>
      </div>
      <div className="clearfix" />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <div className={classes.container}>
                {filtering.buildHeader(
                  'organization_name',
                  'Name',
                  true,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'organization_description',
                  'Description',
                  true,
                  inlineStylesHeaders,
                )}
                {filtering.buildHeader(
                  'organization_tags',
                  'Tags',
                  true,
                  inlineStylesHeaders,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedOrganizations.map((organization) => (
          <ListItem
            key={organization.organization_id}
            classes={{ root: classes.item }}
            divider
          >
            <ListItemIcon>
              <DomainOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.container}>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.organization_name}
                  >
                    {organization.organization_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.organization_description}
                  >
                    {truncate(
                      organization.organization_description || '-',
                      50,
                    )}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.organization_tags}
                  >
                    <ItemTags
                      variant="list"
                      tags={organization.organization_tags}
                    />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <OrganizationPopover
                organization={organization}
                tagsMap={tagsMap}
                openEditOnInit={organization.organization_id === searchId}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <CreateOrganization />}
    </>
  );
};

export default Organizations;
