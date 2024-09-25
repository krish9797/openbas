import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { ImageOutlined } from '@mui/icons-material';
import { FilePdfBox, FileDelimitedOutline } from 'mdi-material-ui';
import { withTheme, withStyles } from '@mui/styles';
import * as R from 'ramda';
import { Menu, MenuItem, Dialog, Tooltip, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import themeLight from './ThemeLight';
import themeDark from './ThemeDark';
import { storeHelper } from '../actions/Schema';
import { exportImage, exportPdf } from '../utils/Image';
import inject18n from './i18n';
import Loader from './Loader';
import { localUpdateUser } from '../actions/User';

const styles = () => ({
  exportButtons: {
    display: 'flex',
  },
  loader: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

class ExportButtons extends Component {
  constructor(props) {
    super(props);
    this.adjust = props.adjust;
    this.csvLink = React.createRef();
    this.state = {
      anchorElImage: null,
      anchorElPdf: null,
      exporting: props.me.user_exporting || false,
    };
  }

  handleOpenImage(event) {
    this.setState({ anchorElImage: event.currentTarget });
  }

  handleCloseImage() {
    this.setState({ anchorElImage: null });
  }

  exportImage(domElementId, name, theme, background) {
    this.setState({ exporting: true });
    this.handleCloseImage();
    const { theme: currentTheme, pixelRatio = 1 } = this.props;
    let timeout = 4000;
    if (theme !== currentTheme.palette.mode) {
      timeout = 6000;
      this.props.localUpdateUser({
        entities: {
          users: {
            [this.props.me.user_id]: {
              ...this.props.me,
              user_theme: theme,
              user_exporting: true,
            },
          },
        },
      });
    }
    setTimeout(() => {
      const container = document.getElementById(domElementId);
      const { offsetWidth, offsetHeight } = container;
      if (theme === currentTheme.palette.mode && this.adjust) {
        this.adjust(true);
      }
      setTimeout(() => {
        exportImage(
          domElementId,
          offsetWidth,
          offsetHeight,
          name,
          // eslint-disable-next-line no-nested-ternary
          background
            ? theme === 'light'
              ? themeLight().palette.background.default
              : themeDark().palette.background.default
            : null,
          pixelRatio,
          this.adjust,
        ).then(() => {
          if (theme !== currentTheme.palette.mode) {
            this.props.localUpdateUser({
              entities: {
                users: {
                  [this.props.me.user_id]: {
                    ...this.props.me,
                    user_theme: currentTheme.palette.mode,
                    user_exporting: false,
                  },
                },
              },
            });
          }
          return this.setState({ exporting: false });
        });
      }, timeout / 2);
    }, timeout);
  }

  handleOpenPdf(event) {
    this.setState({ anchorElPdf: event.currentTarget });
  }

  handleClosePdf() {
    this.setState({ anchorElPdf: null });
  }

  exportPdf(domElementId, name, theme, background) {
    this.setState({ exporting: true });
    this.handleClosePdf();
    const { theme: currentTheme, pixelRatio = 1 } = this.props;
    let timeout = 4000;
    if (theme !== currentTheme.palette.mode) {
      timeout = 6000;
      this.props.localUpdateUser({
        entities: {
          users: {
            [this.props.me.user_id]: {
              ...this.props.me,
              user_theme: theme,
              user_exporting: true,
            },
          },
        },
      });
    }
    setTimeout(() => {
      exportPdf(
        domElementId,
        name,
        // eslint-disable-next-line no-nested-ternary
        background
          ? theme === 'light'
            ? themeLight().palette.background.default
            : themeDark().palette.background.default
          : null,
        pixelRatio,
        this.adjust,
      ).then(() => {
        if (theme !== currentTheme.palette.mode) {
          this.props.localUpdateUser({
            entities: {
              users: {
                [this.props.me.user_id]: {
                  ...this.props.me,
                  user_theme: currentTheme.palette.mode,
                  user_exporting: false,
                },
              },
            },
          });
        }
        return this.setState({ exporting: false });
      });
    }, timeout);
  }

  render() {
    const { anchorElImage, anchorElPdf, exporting } = this.state;
    const { classes, t, domElementId, name, csvData, csvFileName, style = {} } = this.props;
    return (
      <div className={classes.exportButtons} style={style}>
        <ToggleButtonGroup size="small" color="secondary" exclusive={true}>
          <Tooltip title={t('Export to image')}>
            <ToggleButton onClick={this.handleOpenImage.bind(this)}>
              <ImageOutlined fontSize="small" color="primary" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('Export to PDF')}>
            <ToggleButton onClick={this.handleOpenPdf.bind(this)}>
              <FilePdfBox fontSize="small" color="primary" />
            </ToggleButton>
          </Tooltip>
          {csvData && (
            <Tooltip title={t('Export to CSV')}>
              <ToggleButton onClick={() => this.csvLink.current.link.click()}>
                <FileDelimitedOutline fontSize="small" color="primary" />
              </ToggleButton>
            </Tooltip>
          )}
        </ToggleButtonGroup>
        <Menu
          anchorEl={anchorElImage}
          open={Boolean(anchorElImage)}
          onClose={this.handleCloseImage.bind(this)}
        >
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'dark',
              true,
            )}
          >
            {t('Dark (with background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'dark',
              false,
            )}
          >
            {t('Dark (without background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'light',
              true,
            )}
          >
            {t('Light (with background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'light',
              false,
            )}
          >
            {t('Light (without background)')}
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={anchorElPdf}
          open={Boolean(anchorElPdf)}
          onClose={this.handleClosePdf.bind(this)}
        >
          <MenuItem
            onClick={this.exportPdf.bind(
              this,
              domElementId,
              name,
              'dark',
              true,
            )}
          >
            {t('Dark')}
          </MenuItem>
          <MenuItem
            onClick={this.exportPdf.bind(
              this,
              domElementId,
              name,
              'light',
              true,
            )}
          >
            {t('Light')}
          </MenuItem>
        </Menu>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={exporting}
          keepMounted={true}
          fullScreen={true}
          classes={{ paper: classes.loader }}
        >
          <Loader />
        </Dialog>
        {csvData && (
          <CSVLink
            filename={csvFileName || `${t('CSV data.')}.csv`}
            ref={this.csvLink}
            data={csvData}
          />
        )}
      </div>
    );
  }
}

ExportButtons.propTypes = {
  t: PropTypes.func,
  me: PropTypes.object,
  localUpdateUser: PropTypes.func,
  domElementId: PropTypes.string,
  name: PropTypes.string,
};

const select = (state) => {
  const helper = storeHelper(state);
  const me = helper.getMe();
  return { me };
};

export default R.compose(
  connect(select, { localUpdateUser }),
  inject18n,
  withTheme,
  withStyles(styles),
)(ExportButtons);
