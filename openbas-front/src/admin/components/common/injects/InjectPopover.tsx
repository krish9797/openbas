import React, { FunctionComponent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem, Table, TableBody, TableCell, TableRow } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { useFormatter } from '../../../../components/i18n';
import Transition from '../../../../components/common/Transition';
import { InjectContext, PermissionsContext } from '../Context';
import type { Inject, InjectStatus, InjectStatusExecution, InjectTestStatus } from '../../../../utils/api-types';
import { duplicateInjectForExercise, duplicateInjectForScenario } from '../../../../actions/Inject';
import { testInject } from '../../../../actions/injects/inject-action';
import { useAppDispatch } from '../../../../utils/hooks';
import DialogDuplicate from '../../../../components/common/DialogDuplicate';
import { useHelper } from '../../../../store';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import DialogTest from '../../../../components/common/DialogTest';
import { MESSAGING$ } from '../../../../utils/Environment';
import type { InjectStore } from '../../../../actions/injects/Inject';

type InjectPopoverType = {
  inject_id: string,
  inject_exercise?: string,
  inject_scenario?: string,
  inject_status?: InjectStatus,
  inject_testable?: boolean,
  inject_teams?: string[],
  inject_type?: string,
  inject_enabled?: boolean,
  inject_title?: string,
};

interface Props {
  inject: InjectPopoverType;
  setSelectedInjectId: (injectId: Inject['inject_id']) => void;
  isDisabled: boolean;
  canBeTested?: boolean;
  canDone?: boolean;
  canTriggerNow?: boolean;
  exerciseOrScenarioId?: string;
  onCreate?: (result: { result: string, entities: { injects: Record<string, InjectStore> } }) => void;
  onUpdate?: (result: { result: string, entities: { injects: Record<string, InjectStore> } }) => void;
  onDelete?: (result: string) => void;
}

const InjectPopover: FunctionComponent<Props> = ({
  inject,
  setSelectedInjectId,
  isDisabled,
  canBeTested = false,
  canDone = false,
  canTriggerNow = false,
  exerciseOrScenarioId,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);
  const {
    onUpdateInjectTrigger,
    onUpdateInjectActivation,
    onInjectDone,
    onDeleteInject,
  } = useContext(InjectContext);

  const [openDelete, setOpenDelete] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [openTest, setOpenTest] = useState(false);
  const [openEnable, setOpenEnable] = useState(false);
  const [openDisable, setOpenDisable] = useState(false);
  const [openDone, setOpenDone] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [openTrigger, setOpenTrigger] = useState(false);
  const [injectResult, setInjectResult] = useState<InjectStatus | null>(null);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const isExercise = useHelper((helper: ExercisesHelper) => helper.getExercisesMap()[exerciseOrScenarioId!] !== undefined);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => setAnchorEl(null);

  const handleOpenDuplicate = () => {
    setDuplicate(true);
    handlePopoverClose();
  };
  const handleCloseDuplicate = () => setDuplicate(false);

  const submitDuplicate = () => {
    if (inject.inject_exercise) {
      dispatch(duplicateInjectForExercise(inject.inject_exercise, inject.inject_id)).then((result: { result: string, entities: { injects: Record<string, InjectStore> } }) => {
        onCreate?.(result);
      });
    }
    if (inject.inject_scenario) {
      dispatch(duplicateInjectForScenario(inject.inject_scenario, inject.inject_id)).then((result: { result: string, entities: { injects: Record<string, InjectStore> } }) => {
        onCreate?.(result);
      });
    }
    handleCloseDuplicate();
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    onDeleteInject(inject.inject_id).then(() => {
      onDelete?.(inject.inject_id);
      handleCloseDelete();
    });
  };

  const handleCloseResult = () => {
    setOpenResult(false);
    setInjectResult(null);
  };

  const handleOpenTest = () => {
    setOpenTest(true);
    handlePopoverClose();
  };
  const handleCloseTest = () => setOpenTest(false);

  const submitTest = () => {
    testInject(inject.inject_id).then((result: { data: InjectTestStatus }) => {
      if (isExercise) {
        MESSAGING$.notifySuccess(t('Inject test has been sent, you can view test logs details on {itsDedicatedPage}.', {
          itsDedicatedPage: <Link to={`/admin/exercises/${exerciseOrScenarioId}/tests/${result.data.status_id}`}>{t('its dedicated page')}</Link>,
        }));
      } else {
        MESSAGING$.notifySuccess(t('Inject test has been sent, you can view test logs details on {itsDedicatedPage}.', {
          itsDedicatedPage: <Link to={`/admin/scenarios/${exerciseOrScenarioId}/tests/${result.data.status_id}`}>{t('its dedicated page')}</Link>,
        }));
      }
    });
    handleCloseTest();
  };

  const handleOpenEnable = () => {
    setOpenEnable(true);
    handlePopoverClose();
  };
  const handleCloseEnable = () => setOpenEnable(false);

  const submitEnable = () => {
    onUpdateInjectActivation(inject.inject_id, { inject_enabled: true }).then((result) => {
      onUpdate?.(result);
      handleCloseEnable();
    });
  };

  const handleOpenDisable = () => {
    setOpenDisable(true);
    handlePopoverClose();
  };
  const handleCloseDisable = () => setOpenDisable(false);

  const submitDisable = () => {
    onUpdateInjectActivation(inject.inject_id, { inject_enabled: false }).then((result) => {
      onUpdate?.(result);
      handleCloseDisable();
    });
  };

  const handleOpenDone = () => {
    setOpenDone(true);
    handlePopoverClose();
  };
  const handleCloseDone = () => setOpenDone(false);

  const submitDone = () => {
    onInjectDone?.(inject.inject_id).then((result) => {
      onUpdate?.(result);
      handleCloseDone();
    });
  };

  const handleOpenEditContent = () => {
    setSelectedInjectId(inject.inject_id);
    handlePopoverClose();
  };

  const handleOpenTrigger = () => {
    setOpenTrigger(true);
    handlePopoverClose();
  };
  const handleCloseTrigger = () => setOpenTrigger(false);

  const submitTrigger = () => {
    onUpdateInjectTrigger?.(inject.inject_id).then((result) => {
      onUpdate?.(result);
      handleCloseTrigger();
    });
  };

  return (
    <>
      <IconButton
        onClick={handlePopoverOpen}
        aria-haspopup="true"
        size="large"
        color="primary"
        disabled={permissions.readOnly}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenDuplicate} disabled={isDisabled}>
          {t('Duplicate')}
        </MenuItem>
        <MenuItem
          onClick={handleOpenEditContent}
          disabled={isDisabled}
        >
          {t('Update')}
        </MenuItem>
        {!inject.inject_status && onInjectDone && canDone && (
        <MenuItem
          onClick={handleOpenDone}
          disabled={isDisabled}
        >
          {t('Mark as done')}
        </MenuItem>
        )}
        {inject.inject_testable && canBeTested && (
          <MenuItem onClick={handleOpenTest}>
            {t('Test')}
          </MenuItem>
        )}
        {inject.inject_type !== 'openbas_manual' && canTriggerNow && onUpdateInjectTrigger && (
          <MenuItem
            onClick={handleOpenTrigger}
            disabled={isDisabled || !permissions.isRunning}
          >
            {t('Trigger now')}
          </MenuItem>
        )}
        {inject.inject_enabled ? (
          <MenuItem
            onClick={handleOpenDisable}
            disabled={isDisabled}
          >
            {t('Disable')}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handleOpenEnable}
            disabled={isDisabled}
          >
            {t('Enable')}
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenDelete}>
          {t('Delete')}
        </MenuItem>
      </Menu>
      <DialogDuplicate
        open={duplicate}
        handleClose={handleCloseDuplicate}
        handleSubmit={submitDuplicate}
        text={`${t('Do you want to duplicate this inject:')} ${inject.inject_title} ?`}
      />
      <Dialog
        TransitionComponent={Transition}
        open={openDone}
        onClose={handleCloseDone}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t(`Do you want to mark this inject as done: ${inject.inject_title}?`)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDone}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDone}>
            {t('Mark')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {`${t('Do you want to delete this inject:')} ${inject.inject_title} ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <DialogTest
        open={openTest}
        handleClose={handleCloseTest}
        handleSubmit={submitTest}
        text={`${t('Do you want to test this inject:')} ${inject.inject_title} ?`}
      />
      <Dialog
        TransitionComponent={Transition}
        open={openEnable}
        onClose={handleCloseEnable}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t(`Do you want to enable this inject: ${inject.inject_title}?`)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnable}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitEnable}>
            {t('Enable')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openDisable}
        onClose={handleCloseDisable}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {`${t('Do you want to disable this inject:')} ${inject.inject_title} ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisable}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDisable}>
            {t('Disable')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openDone}
        onClose={handleCloseDone}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t(`Do you want to mark this inject as done: ${inject.inject_title}?`)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDone}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDone}>
            {t('Mark')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openTrigger}
        onClose={handleCloseTrigger}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t(`Do you want to trigger this inject now: ${inject.inject_title}?`)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrigger}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitTrigger}>
            {t('Trigger')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openResult}
        TransitionComponent={Transition}
        onClose={handleCloseResult}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          {/* TODO: selectable={false} */}
          <Table size="small">
            {/* TODO: displayRowCheckbox={false} */}
            <TableBody>
              {injectResult && Object.entries(injectResult).map(
                ([key, value]) => {
                  if (key === 'status_traces') {
                    return (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>
                          {/* TODO: selectable={false} */}
                          <Table size="small" key={key}>
                            {/* TODO: displayRowCheckbox={false} */}
                            <TableBody>
                              <>
                                {value?.filter((trace: InjectStatusExecution) => !!trace.execution_message)
                                  .map((trace: InjectStatusExecution) => (
                                    <TableRow key={trace.execution_category}>
                                      <TableCell>
                                        {trace.execution_message}
                                      </TableCell>
                                      <TableCell>
                                        {trace.execution_status}
                                      </TableCell>
                                      <TableCell>{trace.execution_time}</TableCell>
                                    </TableRow>
                                  ))}
                              </>
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  );
                },
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InjectPopover;
