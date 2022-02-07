import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { HowToVoteOutlined } from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import * as R from 'ramda';
import { useFormatter } from '../../../../components/i18n';
import { useStore } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import {
  addEvaluation,
  fetchEvaluations,
  updateEvaluation,
} from '../../../../actions/Evaluation';
import { resolveUserName } from '../../../../utils/String';
import Loader from '../../../../components/Loader';
import {
  isExerciseReadOnly,
  isExerciseUpdatable,
} from '../../../../utils/Exercise';

const ObjectiveEvaluations = ({ objectiveId, handleClose }) => {
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [value, setValue] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Fetching data
  const { exerciseId } = useParams();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const objective = useStore((store) => store.getObjective(objectiveId));
  const me = useStore((store) => store.me);
  const evaluations = objective ? objective.evaluations : [];
  useDataLoader(() => {
    dispatch(fetchEvaluations(exerciseId, objectiveId));
  });
  const currentUserEvaluation = R.head(
    R.filter((n) => n.evaluation_user === me.user_id, evaluations),
  );
  const submitEvaluation = () => {
    setSubmitting(true);
    const data = {
      evaluation_score: value,
    };
    if (currentUserEvaluation) {
      return dispatch(
        updateEvaluation(
          exerciseId,
          objectiveId,
          currentUserEvaluation.evaluation_id,
          data,
        ),
      ).then((result) => {
        if (result.result) {
          return handleClose();
        }
        return result;
      });
    }
    return dispatch(addEvaluation(exerciseId, objectiveId, data)).then(
      (result) => {
        if (result.result) {
          return handleClose();
        }
        return result;
      },
    );
  };
  if (!objective) {
    return <Loader />;
  }
  return (
    <div>
      {evaluations.length > 0 ? (
        <List style={{ padding: 0 }}>
          {evaluations.map((evaluation) => (
            <ListItem key={evaluation.evaluation_id} divider={true}>
              <ListItemIcon>
                <HowToVoteOutlined />
              </ListItemIcon>
              <ListItemText
                style={{ width: '50%' }}
                primary={resolveUserName(evaluation.user)}
              />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '30%',
                  marginRight: 1,
                }}
              >
                <Box sx={{ width: '100%', mr: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={evaluation.evaluation_score}
                  />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                  <Typography variant="body2" color="text.secondary">
                    {evaluation.evaluation_score}%
                  </Typography>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <List style={{ padding: 0 }}>
          <ListItem divider={true}>
            <ListItemIcon>
              <HowToVoteOutlined />
            </ListItemIcon>
            <ListItemText
              style={{ width: '50%' }}
              primary={
                <i>{t('There is no evaluation for this objective yet')}</i>
              }
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '30%',
                marginRight: 1,
              }}
            >
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" value={0} />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  -
                </Typography>
              </Box>
            </Box>
          </ListItem>
        </List>
      )}
      {isExerciseUpdatable(exercise, true) && (
        <Box
          sx={{
            width: '100%',
            marginTop: '30px',
            padding: '0 5px 0 5px',
          }}
        >
          <Typography variant="overline">{t('My evaluation')}</Typography>
          <Slider
            aria-label={t('Score')}
            value={
              value === null
                ? currentUserEvaluation?.evaluation_score || 10
                : value
            }
            onChange={(_, val) => setValue(val)}
            valueLabelDisplay="auto"
            step={5}
            marks={true}
            min={10}
            max={100}
          />
        </Box>
      )}
      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleClose}
          style={{ marginRight: isExerciseUpdatable(exercise, true) ? 10 : 0 }}
          disabled={submitting}
        >
          {isExerciseUpdatable(exercise, true) ? t('Cancel') : t('Close')}
        </Button>
        {isExerciseUpdatable(exercise, true) && (
          <Button
            variant="contained"
            color="primary"
            onClick={submitEvaluation}
            disabled={submitting}
          >
            {t('Evaluate')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ObjectiveEvaluations;
