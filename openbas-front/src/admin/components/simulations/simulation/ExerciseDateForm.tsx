import React, { useState } from 'react';
import { Button, FormControlLabel, Stack, Switch } from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ExerciseUpdateStartDateInput } from '../../../../utils/api-types';
import { useFormatter } from '../../../../components/i18n';
import { zodImplement } from '../../../../utils/Zod';
import { minutesInFuture } from '../../../../utils/Time';

interface Props {
  onSubmit: SubmitHandler<ExerciseUpdateStartDateInput>;
  initialValues?: ExerciseUpdateStartDateInput;
  handleClose: () => void;
}

interface ExerciseStartDateAndTime {
  date: string;
  time: string;
}

// eslint-disable-next-line no-underscore-dangle
const _MS_DELAY_TOO_CLOSE = 1000 * 60 * 2;

const ExerciseDateForm: React.FC<Props> = ({
  onSubmit,
  handleClose,
  initialValues,
}) => {
  const { t } = useFormatter();

  const defaultFormValues = () => {
    if (initialValues?.exercise_start_date) {
      const date = new Date(initialValues.exercise_start_date);
      return ({
        date: new Date(new Date(date).setHours(0, 0, 0, 0)).toISOString(),
        time: new Date(new Date().setHours(date.getHours(), date.getMinutes(), date.getSeconds(), 0)).toISOString(),
      });
    }
    return ({
      date: new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString(),
      time: minutesInFuture(5).toDate().toISOString(),
    });
  };

  const [checked, setChecked] = useState(!initialValues?.exercise_start_date);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };

  const submit = (data: ExerciseStartDateAndTime) => {
    if (checked) {
      onSubmit({ exercise_start_date: '' });
    } else {
      const { date, time } = data;
      const newDate = new Date(date);
      const newTime = new Date(time);
      newDate.setHours(newTime.getHours(), newTime.getMinutes(), newTime.getSeconds());
      onSubmit({ exercise_start_date: newDate.toISOString() });
    }
  };

  const {
    control,
    handleSubmit,
    clearErrors,
    getValues,
  } = useForm<ExerciseStartDateAndTime>({
    defaultValues: defaultFormValues(),
    resolver: zodResolver(
      zodImplement<ExerciseStartDateAndTime>().with({
        date: z.string().refine(
          (data) => {
            if (!checked) {
              return !!data;
            }
            return true;
          },
          { message: t('Required') },
        ),

        time: z.any().refine(
          (data) => {
            if (!checked) {
              return !!data;
            }
            return true;
          },
          { message: t('Required') },
        ),
      })
        .refine(
          (data) => {
            if (!checked) {
              return new Date(new Date().setHours(0, 0, 0, 0)).getTime() !== new Date(data.date).getTime()
                          || (new Date().getTime() + _MS_DELAY_TOO_CLOSE) < new Date(data.time).getTime();
            }
            return true;
          },
          {
            message: t('The time and start date do not match, as the time provided is either too close to the current moment or in the past'),
            path: ['time'],
          },
        )
        .refine(
          (data) => {
            if (!checked) {
              const time = new Date(data.time);
              return new Date(new Date(data.date).setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0)).getTime()
                  >= new Date(new Date().setHours(0, 0, 0, 0)).getTime();
            }
            return true;
          },
          { message: t('Date should be at least today'), path: ['date'] },
        ),
    ),
  });

  return (
    <form id="exerciseDateForm" onSubmit={handleSubmit(submit)}>
      <FormControlLabel
        control={<Switch onChange={handleChange} checked={checked} />}
        label={t('Manual launch')}
      />

      <Stack spacing={{ xs: 2 }}>
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <DatePicker
              views={['year', 'month', 'day']}
              label={t('Start date (optional)')}
              disabled={checked}
              minDate={new Date(new Date().setUTCHours(0, 0, 0, 0))}
              value={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date?.toISOString())}
              onAccept={() => {
                clearErrors('time');
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          )}
        />

        <Controller
          control={control}
          name="time"
          render={({ field, fieldState }) => (
            <TimePicker
              label={t('Scheduling_time')}
              openTo="hours"
              timeSteps={{ minutes: 15 }}
              skipDisabled
              thresholdToRenderTimeInASingleColumn={100}
              disabled={checked}
              closeOnSelect={false}
              value={field.value ? new Date(field.value) : null}
              minTime={new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() === new Date(getValues('date')).getTime() ? new Date() : undefined}
              onChange={(time) => (field.onChange(time?.toISOString()))}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          )}
        />
      </Stack>

      <div style={{ float: 'right', marginTop: 20 }}>
        {handleClose && (
        <Button
          onClick={handleClose.bind(this)}
          style={{ marginRight: 10 }}
        >
          {t('Cancel')}
        </Button>
        )}
        <Button
          color="secondary"
          type="submit"
        >
          {t('Save')}
        </Button>
      </div>
    </form>
  );
};
export default ExerciseDateForm;
