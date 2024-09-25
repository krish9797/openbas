import React, { useContext } from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ContentPasteOutlined } from '@mui/icons-material';

import type { Report } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import ReportPopover from './ReportPopover';
import { PermissionsContext } from '../../common/Context';

interface Props {
  reports: Report[],
  navigateToReportPage: (id: string) => void
}

const Reports: React.FC<Props> = ({ reports, navigateToReportPage }) => {
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);

  if (reports.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 20 }}>
        <i>{t('There is no report for this simulation yet')}</i>
      </div>
    );
  }

  return (
    <List style={{ padding: 0 }}>
      {reports.map((report) => {
        return (
          <ListItem
            key={report.report_id}
            divider={true}
            style={{ height: 50, padding: 0 }}
            secondaryAction={permissions.canWrite
              && <ReportPopover
                report={report}
                actions={['Delete', 'Update']}
                 />
            }
          >
            <ListItemButton onClick={() => navigateToReportPage(report.report_id)}>
              <ListItemIcon>
                <ContentPasteOutlined color="primary" />
              </ListItemIcon>
              <ListItemText>
                {report.report_name}
              </ListItemText>

            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};

export default Reports;
