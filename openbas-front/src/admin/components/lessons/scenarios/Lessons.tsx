import React, { useContext, useState } from 'react';
import { ContentPasteGoOutlined, DeleteSweepOutlined, VisibilityOutlined } from '@mui/icons-material';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  Radio,
  RadioGroup,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import ObjectiveEvaluations from '../ObjectiveEvaluations';
import CreateLessonsCategory from '../categories/CreateLessonsCategory';
import { useFormatter } from '../../../../components/i18n';
import type { Inject, LessonsAnswer, LessonsCategory, LessonsQuestion, LessonsTemplate, Objective, Team, User } from '../../../../utils/api-types';
import Transition from '../../../../components/common/Transition';
import CreateLessonsTemplate from '../../components/lessons/CreateLessonsTemplate';
import { LessonContext } from '../../common/Context';
import LessonsCategories from './LessonsCategories';
import LessonsObjectives from './LessonsObjectives';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  paperPadding: {
    position: 'relative',
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '90%',
  },
}));

interface GenericSource {
  id: string;
  type: string;
  name: string;
  communications_number: number;
  start_date: string;
  end_date: string;
  users_number: number;
  logs_number: number;
  lessons_anonymized: boolean;
  isReadOnly: boolean;
  isUpdatable: boolean;
}

interface Props {
  source: GenericSource,
  objectives: Objective[],
  injects: Inject[],
  teamsMap: Record<string, Team>,
  teams: Team[],
  lessonsCategories: LessonsCategory[],
  lessonsQuestions: LessonsQuestion[],
  lessonsAnswers?: LessonsAnswer[],
  lessonsTemplates: LessonsTemplate[],
  usersMap: Record<string, User>,
}

const Lessons: React.FC<Props> = ({
  source,
  objectives,
  teams,
  teamsMap,
  lessonsCategories,
  lessonsQuestions,
  lessonsTemplates,
}) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();

  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [openApplyTemplate, setOpenApplyTemplate] = useState<boolean>(false);
  const [openEmptyLessons, setOpenEmptyLessons] = useState<boolean>(false);
  const [openAnonymize, setOpenAnonymize] = useState<boolean>(false);
  const [templateValue, setTemplateValue] = useState<string | null>(null);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateValue(event.target.value);
  };

  // Context
  const {
    onApplyLessonsTemplate,
    onEmptyLessonsCategories,
    onUpdateSourceLessons,
  } = useContext(LessonContext);

  const applyTemplate = async () => {
    if (templateValue !== null) {
      await onApplyLessonsTemplate(templateValue);
      return setOpenApplyTemplate(false);
    }
    return setOpenApplyTemplate(true);
  };
  const emptyLessons = async () => {
    await onEmptyLessonsCategories();
    return setOpenEmptyLessons(false);
  };
  const toggleAnonymize = async () => {
    const updatedSource = { ...source };
    await onUpdateSourceLessons(!updatedSource.lessons_anonymized);
    updatedSource.lessons_anonymized = !updatedSource.lessons_anonymized;
    return setOpenAnonymize(false);
  };
  return (
    <div style={{ marginBottom: '30px' }}>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Typography variant="h4">{t('Parameters')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperPadding }}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Questionnaire mode')}</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      disabled={false}
                      checked={source.lessons_anonymized}
                      onChange={() => {
                        if (!source.lessons_anonymized) {
                          setOpenAnonymize(true);
                        } else {
                          toggleAnonymize();
                        }
                      }}
                      name="anonymized"
                    />
                                    }
                  label={t('Anonymize answers')}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Template')}</Typography>
                <Button
                  startIcon={<ContentPasteGoOutlined/>}
                  color="primary"
                  variant="contained"
                  onClick={() => setOpenApplyTemplate(true)}
                >
                  {t('Apply')}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">{t('Check')}</Typography>
                <Button
                  startIcon={<VisibilityOutlined/>}
                  color="secondary"
                  variant="contained"
                  component={Link}
                  href={`/lessons/${source.type}/${source.id}?preview=true`}
                >
                  {t('Preview')}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h3">
                  {t('Categories and questions')}
                </Typography>
                <Button
                  startIcon={<DeleteSweepOutlined/>}
                  color="error"
                  variant="contained"
                  onClick={() => setOpenEmptyLessons(true)}
                >
                  {t('Clear out')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={8}>
          <LessonsObjectives
            objectives={objectives}
            setSelectedObjective={setSelectedObjective}
            source={source}
            isReport={false}
          />
        </Grid>
      </Grid>
      <LessonsCategories
        lessonsCategories={lessonsCategories}
        lessonsQuestions={lessonsQuestions}
        teamsMap={teamsMap}
        teams={teams}
        isReport={false}
      />
      <CreateLessonsCategory/>
      <Dialog
        TransitionComponent={Transition}
        keepMounted={false}
        open={selectedObjective !== null}
        onClose={() => setSelectedObjective(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Objective achievement evaluation')}</DialogTitle>
        <DialogContent>
          <ObjectiveEvaluations
            objectiveId={selectedObjective}
            isUpdatable={source.isUpdatable}
            handleClose={() => setSelectedObjective(null)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        keepMounted={false}
        open={openApplyTemplate}
        onClose={() => setOpenApplyTemplate(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Apply a lessons learned template')}</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            {t(
              `Applying a template will add all categories and questions of the selectedtemplate to this ${source.type}.`,
            )}
          </Alert>
          <FormControl style={{ margin: '10px 0 0 5px', width: '100%' }}>
            <RadioGroup
              style={{ width: '100%' }}
              aria-labelledby="controlled-radio-buttons-group"
              name="template"
              value={templateValue}
              onChange={handleChange}
            >
              {lessonsTemplates.map((template: LessonsTemplate) => {
                return (
                  <FormControlLabel
                    key={template.lessonstemplate_id}
                    style={{
                      width: '100%',
                      borderBottom: `1px solid ${theme.palette.background.paper}`,
                      margin: 0,
                    }}
                    value={template.lessonstemplate_id}
                    control={<Radio/>}
                    label={
                      <div style={{ margin: '15px 0 15px 10px' }}>
                        <Typography variant="h4">
                          {template.lessons_template_name}
                        </Typography>
                        <Typography variant="body2">
                          {template.lessons_template_description || t('No description')}
                        </Typography>
                      </div>
                                        }
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
          <CreateLessonsTemplate inline/>
          <div className="clearfix"/>
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={() => setOpenApplyTemplate(false)}
              style={{ marginRight: 10 }}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={applyTemplate}
              disabled={templateValue === null}
            >
              {t('Apply')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openEmptyLessons}
        TransitionComponent={Transition}
        onClose={() => setOpenEmptyLessons(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t(
              'Do you want to empty lessons learned categories and questions?',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmptyLessons(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={emptyLessons}>
            {t('Clear out')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openAnonymize}
        TransitionComponent={Transition}
        onClose={() => setOpenAnonymize(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to anonymize lessons learned questionnaire?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAnonymize(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={toggleAnonymize}>
            {t('Anonymize')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Lessons;
