import { Autocomplete, Checkbox, TextField } from '@mui/material';
import React, { FunctionComponent, useEffect } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useFormatter } from '../../../i18n';
import type { Filter, PropertySchemaDTO } from '../../../../utils/api-types';
import { FilterHelpers } from './FilterHelpers';
import useSearchOptions from './useSearchOptions';

interface Props {
  filter: Filter;
  helpers: FilterHelpers;
}

export const BasicTextInput: FunctionComponent<Props> = ({
  filter,
  helpers,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      label={t(filter.key)}
      defaultValue={filter.values?.[0] ?? ''}
      autoFocus
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          helpers.handleAddSingleValueFilter(
            filter.key,
            (event.target as HTMLInputElement).value,
          );
        }
      }}
      onBlur={(event) => {
        helpers.handleAddSingleValueFilter(
          filter.key,
          (event.target as HTMLInputElement).value,
        );
      }}
    />
  );
};

export const BasicSelectInput: FunctionComponent<Props & { propertySchema: PropertySchemaDTO }> = ({
  filter,
  helpers,
  propertySchema,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const { options, setOptions, searchOptions } = useSearchOptions();
  useEffect(() => {
    if (propertySchema.schema_property_values && propertySchema.schema_property_values?.length > 0) {
      setOptions(propertySchema.schema_property_values.map((v) => ({ id: v, label: t(v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()) })));
    } else {
      searchOptions(filter.key);
    }
  }, []);

  const onClick = (optionId: string) => {
    const isIncluded = filter.values?.includes(optionId);
    const newValues = isIncluded
      ? (filter.values?.filter((v) => v !== optionId) ?? [])
      : [...filter.values ?? [], optionId];
    helpers.handleAddMultipleValueFilter(filter.key, newValues);
  };

  return (
    <Autocomplete
      selectOnFocus
      openOnFocus
      autoHighlight
      multiple
      noOptionsText={t('No available options')}
      options={options}
      getOptionLabel={(option) => option.label ?? ''}
      onInputChange={(_, search) => searchOptions(filter.key, search)}
      renderInput={(paramsInput) => (
        <TextField
          {...paramsInput}
          label={t(propertySchema.schema_property_name)}
          variant="outlined"
          size="small"
        />
      )}
      renderOption={(props, option) => {
        const checked = filter.values?.includes(option.id);
        return (
          <li
            {...props}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
              }
            }}
            key={option.id}
            onClick={() => onClick(option.id)}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              padding: 0,
              margin: 0,
            }}
          >
            <Checkbox checked={checked} />
            <span style={{ padding: '0 4px 0 4px' }}>{option.label}</span>
          </li>
        );
      }}
    />
  );
};

export const BasicFilterDate: FunctionComponent<Props> = ({
  filter,
  helpers,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  return (
    <DateTimePicker
      label={t(filter.key)}
      onChange={(date) => {
        if (date) {
          helpers.handleAddSingleValueFilter(
            filter.key,
            date.toISOString(),
          );
        }
      }}
      slotProps={{
        textField: {
          variant: 'outlined',
          fullWidth: true,
        },
      }}
    />
  );
};

export const FilterChipPopoverInput: FunctionComponent<Props & { propertySchema: PropertySchemaDTO }> = ({
  propertySchema,
  filter,
  helpers,
}) => {
  const choice = () => {
    // Date field
    if (propertySchema.schema_property_type.includes('instant')) {
      return (<BasicFilterDate filter={filter} helpers={helpers} />);
    }
    // Emptiness
    if (filter?.operator && ['empty', 'not_empty'].includes(filter.operator)) {
      return null;
    }
    // Select field
    if (propertySchema.schema_property_values || propertySchema.schema_property_has_dynamic_value) {
      return (<BasicSelectInput propertySchema={propertySchema} filter={filter} helpers={helpers} />);
    }
    // Simple text field
    return (<BasicTextInput filter={filter} helpers={helpers} />);
  };
  return (choice());
};
