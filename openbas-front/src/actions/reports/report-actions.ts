import { Dispatch } from 'redux';
import type { Exercise, Report, ReportInput } from '../../utils/api-types';
import { delReferential, getReferential, postReferential, putReferential } from '../../utils/Action';
import * as schema from '../Schema';

export const fetchReportsForExercise = (exerciseId: Exercise['exercise_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports`;
  return getReferential(schema.arrayOfReports, uri)(dispatch);
};

export const fetchReport = (reportId: Report['report_id']) => (dispatch: Dispatch) => {
  const uri = `/api/reports/${reportId}`;
  return getReferential(schema.report, uri)(dispatch);
};

export const addReportForExercise = (exerciseId: Exercise['exercise_id'], data: ReportInput) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports`;
  return postReferential(schema.report, uri, data)(dispatch);
};

export const updateReportForExercise = (
  exerciseId: Exercise['exercise_id'],
  reportId: Report['report_id'],
  data: ReportInput,
) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports/${reportId}`;
  return putReferential(schema.report, uri, data)(dispatch);
};

export const deleteReportForExercise = (exerciseId: Exercise['exercise_id'], reportId: Report['report_id']) => (dispatch: Dispatch) => {
  const uri = `/api/exercises/${exerciseId}/reports/${reportId}`;
  return delReferential(uri, 'reports', reportId)(dispatch);
};
