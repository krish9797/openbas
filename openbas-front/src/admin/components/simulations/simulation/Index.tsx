import React, { FunctionComponent, lazy, Suspense, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { Alert, AlertTitle, Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { fetchExercise } from '../../../../actions/Exercise';
import { errorWrapper } from '../../../../components/Error';
import Loader from '../../../../components/Loader';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../utils/hooks';
import ExerciseHeader from './ExerciseHeader';
import type { Exercise as ExerciseType } from '../../../../utils/api-types';
import { DocumentContext, DocumentContextType, InjectContext, PermissionsContext, PermissionsContextType } from '../../common/Context';
import { usePermissions } from '../../../../utils/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import NotFound from '../../../../components/NotFound';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import ExerciseDatePopover from './ExerciseDatePopover';
import injectContextForExercise from './ExerciseContext';

const Exercise = lazy(() => import('./overview/Exercise'));
const Dryrun = lazy(() => import('./controls/Dryrun'));
const Comcheck = lazy(() => import('./controls/Comcheck'));
const Lessons = lazy(() => import('./lessons/ExerciseLessons'));
const ExerciseDefinition = lazy(() => import('./ExerciseDefinition'));
const Injects = lazy(() => import('./injects/ExerciseInjects'));
const Tests = lazy(() => import('./tests/ExerciseTests'));
const TimelineOverview = lazy(() => import('./timeline/TimelineOverview'));
const Mails = lazy(() => import('./mails/Mails'));
const MailsInject = lazy(() => import('./mails/Inject'));
const Logs = lazy(() => import('./logs/Logs'));
const Chat = lazy(() => import('./chat/Chat'));
const Validations = lazy(() => import('./validation/Validations'));

const useStyles = makeStyles(() => ({
  scheduling: {
    display: 'flex',
    margin: '-35px 8px 0 0',
    float: 'right',
    alignItems: 'center',
  },
}));

const IndexComponent: FunctionComponent<{ exercise: ExerciseType }> = ({
  exercise,
}) => {
  const { t, fldt } = useFormatter();
  const location = useLocation();
  const classes = useStyles();
  const permissionsContext: PermissionsContextType = {
    permissions: usePermissions(exercise.exercise_id),
  };
  const documentContext: DocumentContextType = {
    onInitDocument: () => ({
      document_tags: [],
      document_scenarios: [],
      document_exercises: exercise ? [{ id: exercise.exercise_id, label: exercise.exercise_name }] : [],
    }),
  };
  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/definition`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/definition`;
  } else if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/animation`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/animation`;
  } else if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/results`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/results`;
  } else if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/tests`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/tests`;
  }
  return (
    <PermissionsContext.Provider value={permissionsContext}>
      <DocumentContext.Provider value={documentContext}>
        <div style={{ paddingRight: ['/results', '/animation'].some((el) => location.pathname.includes(el)) ? 200 : 0 }}>
          <Breadcrumbs variant="object" elements={[
            { label: t('Simulations'), link: '/admin/exercises' },
            { label: exercise.exercise_name, current: true },
          ]}
          />
          <ExerciseHeader />
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              marginBottom: 4,
            }}
          >
            <Tabs value={tabValue}>
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}`}
                value={`/admin/exercises/${exercise.exercise_id}`}
                label={t('Overview')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/definition`}
                value={`/admin/exercises/${exercise.exercise_id}/definition`}
                label={t('Definition')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/injects`}
                value={`/admin/exercises/${exercise.exercise_id}/injects`}
                label={t('Injects')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/tests`}
                value={`/admin/exercises/${exercise.exercise_id}/tests`}
                label={t('Tests')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/animation`}
                value={`/admin/exercises/${exercise.exercise_id}/animation`}
                label={t('Animation')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/lessons`}
                value={`/admin/exercises/${exercise.exercise_id}/lessons`}
                label={t('Lessons learned')}
              />
            </Tabs>
            <div className={classes.scheduling}>
              <ExerciseDatePopover exercise={exercise} />
              {exercise.exercise_start_date ? fldt(exercise.exercise_start_date) : t('Manual')}
            </div>
          </Box>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="" element={errorWrapper(Exercise)()} />
              <Route path="controls/dryruns/:dryrunId" element={errorWrapper(Dryrun)()} />
              <Route path="controls/comchecks/:comcheckId" element={errorWrapper(Comcheck)()} />
              <Route path="definition" element={errorWrapper(ExerciseDefinition)()} />
              <Route path="injects" element={errorWrapper(Injects)()} />
              <Route path="tests/:statusId?" element={errorWrapper(Tests)()} />
              <Route path="animation" element={<Navigate to="timeline" replace={true} />} />
              <Route path="animation/timeline" element={errorWrapper(TimelineOverview)()} />
              <Route path="animation/mails" element={errorWrapper(Mails)()} />
              <Route path="animation/mails/:injectId" element={errorWrapper(MailsInject)()} />
              <Route path="animation/logs" element={errorWrapper(Logs)()} />
              <Route path="animation/chat" element={errorWrapper(Chat)()} />
              <Route path="animation/validations" element={errorWrapper(Validations)()} />
              <Route path="lessons" element={errorWrapper(Lessons)()} />
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </DocumentContext.Provider>
    </PermissionsContext.Provider>
  );
};

const Index = () => {
  // Standard hooks
  const [loading, setLoading] = useState(true);
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    setLoading(true);
    dispatch(fetchExercise(exerciseId)).finally(() => setLoading(false));
  });

  const exerciseInjectContext = injectContextForExercise(exercise);

  if (loading) {
    return <Loader />;
  }
  if (!loading && !exercise) {
    return (
      <Alert severity="warning">
        <AlertTitle>{t('Warning')}</AlertTitle>
        {t('Simulation is currently unavailable or you do not have sufficient permissions to access it.')}
      </Alert>
    );
  }
  return (
    <InjectContext.Provider value={exerciseInjectContext}>
      <IndexComponent exercise={exercise} />
    </InjectContext.Provider>
  );
};

export default Index;
