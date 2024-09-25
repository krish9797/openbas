import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Tooltip, Typography } from '@mui/material';
import { CancelOutlined, PauseOutlined, PlayArrowOutlined, RestartAltOutlined } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { updateExerciseStatus } from '../../../../actions/Exercise';
import ExercisePopover, { ExerciseActionPopover } from './ExercisePopover';
import { useHelper } from '../../../../store';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { usePermissions } from '../../../../utils/Exercise';
import ExerciseStatus from './ExerciseStatus';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { Exercise as ExerciseType } from '../../../../utils/api-types';
import { truncate } from '../../../../utils/String';
import type { Theme } from '../../../../components/Theme';
import { isFeatureEnabled } from '../../../../utils/utils';

const useStyles = makeStyles(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
  actions: {
    margin: '-6px 0 0 0',
    float: 'right',
    display: 'flex',
  },
}));

const Buttons = ({ exerciseId, exerciseStatus, exerciseName }: {
  exerciseId: ExerciseStore['exercise_id'],
  exerciseStatus: ExerciseStore['exercise_status'],
  exerciseName: ExerciseStore['exercise_name']
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const permissions = usePermissions(exerciseId);
  const [openChangeStatus, setOpenChangeStatus] = useState<ExerciseStore['exercise_status'] | null>(null);
  const submitUpdateStatus = (status: ExerciseStore['exercise_status']) => {
    dispatch(updateExerciseStatus(exerciseId, status));
    setOpenChangeStatus(null);
  };
  const executionButton = () => {
    switch (exerciseStatus) {
      case 'SCHEDULED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              style={{ marginRight: 10, lineHeight: 'initial' }}
              startIcon={<PlayArrowOutlined />}
              variant="contained"
              size="small"
              color="primary"
              onClick={() => setOpenChangeStatus('RUNNING')}
            >
              {t('Start now')}
            </Button>
          );
        }
        return (<div />);
      }
      case 'RUNNING': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              style={{ marginRight: 10 }}
              startIcon={<PauseOutlined />}
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => setOpenChangeStatus('PAUSED')}
            >
              {t('Pause')}
            </Button>
          );
        }
        return (<div />);
      }
      case 'PAUSED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              style={{ marginRight: 10 }}
              variant="outlined"
              startIcon={<PlayArrowOutlined />}
              color="success"
              onClick={() => setOpenChangeStatus('RUNNING')}
            >
              {t('Resume')}
            </Button>
          );
        }
        return <div />;
      }
      default:
        return <div />;
    }
  };

  const dangerousButton = () => {
    switch (exerciseStatus) {
      case 'RUNNING':
      case 'PAUSED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              style={{ marginRight: 10 }}
              variant="outlined"
              startIcon={<CancelOutlined />}
              color="error"
              onClick={() => setOpenChangeStatus('CANCELED')}
            >
              {t('Stop')}
            </Button>
          );
        }
        return <div />;
      }
      case 'FINISHED':
      case 'CANCELED': {
        if (!permissions.readOnlyBypassStatus) {
          return (
            <Button
              style={{ marginRight: 10 }}
              variant="outlined"
              startIcon={<RestartAltOutlined />}
              color="warning"
              onClick={() => setOpenChangeStatus('SCHEDULED')}
            >
              {t('Reset')}
            </Button>
          );
        }
        return <div />;
      }
      default:
        return <div />;
    }
  };

  const dialogContentText = () => {
    switch (openChangeStatus) {
      case 'RUNNING':
        return `${exerciseName} ${t('will be started, do you want to continue?')}`;
      case 'PAUSED':
        return `${t('Injects will be paused, do you want to continue?')}`;
      case 'SCHEDULED':
        return `${exerciseName} ${t('data will be reset, do you want to restart?')}`;
      case 'CANCELED':
        return `${exerciseName} ${t('data will be reset, do you want to restart?')}`;
      default:
        return 'Do you want to change the status of this simulation?';
    }
  };
  return (
    <>
      {executionButton()}
      {dangerousButton()}
      <Dialog
        open={Boolean(openChangeStatus)}
        TransitionComponent={Transition}
        onClose={() => setOpenChangeStatus(null)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {dialogContentText()}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenChangeStatus(null)}>
            {t('Cancel')}
          </Button>
          <Button
            color="secondary"
            onClick={() => submitUpdateStatus({ exercise_status: openChangeStatus })
            }
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const ExerciseHeader = () => {
  // Standard hooks
  const theme = useTheme<Theme>();
  const classes = useStyles();
  const navigate = useNavigate();

  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const { exercise } = useHelper((helper: ExercisesHelper) => {
    return {
      exercise: helper.getExercise(exerciseId),
    };
  });

  const actions: ExerciseActionPopover[] = ['Update', 'Duplicate', 'Export', 'Delete'];
  if (isFeatureEnabled('report')) {
    actions.push('Access reports');
  }

  return (
    <>
      <Tooltip title={exercise.exercise_name}>
        <Typography variant="h1" gutterBottom={true} classes={{ root: classes.title }}>
          {truncate(exercise.exercise_name, 80)}
        </Typography>
      </Tooltip>
      <div style={{ float: 'left', margin: '3px 10px 0 8px', color: theme.palette.text?.disabled, borderLeft: `1px solid ${theme.palette.text?.disabled}`, height: 20 }} />
      <ExerciseStatus exerciseStatus={exercise.exercise_status} exerciseStartDate={exercise.exercise_start_date} />
      <div className={classes.actions}>
        <Buttons exerciseId={exercise.exercise_id} exerciseStatus={exercise.exercise_status} exerciseName={exercise.exercise_name} />
        <ExercisePopover
          exercise={exercise}
          actions={actions}
          onDelete={() => navigate('/admin/exercises')}
        />
      </div>
      <div className="clearfix" />
    </>
  );
};

export default ExerciseHeader;
