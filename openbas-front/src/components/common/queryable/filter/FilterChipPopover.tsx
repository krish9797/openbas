import React, { FunctionComponent } from 'react';
import { MenuItem, Popover, Select, SelectChangeEvent } from '@mui/material';
import { useFormatter } from '../../../i18n';
import { FilterHelpers } from './FilterHelpers';
import type { Filter, PropertySchemaDTO } from '../../../../utils/api-types';
import { availableOperators, OperatorKeyValues } from './FilterUtils';
import { FilterChipPopoverInput } from './FilterChipPopoverInput';
import ScenarioStatusFilter from './specific/ScenarioStatusFilter';

interface Props {
  filter: Filter;
  helpers: FilterHelpers;
  propertySchema: PropertySchemaDTO;
  open: boolean;
  onClose: () => void;
  anchorEl?: HTMLElement;
}

const FilterChipPopover: FunctionComponent<Props> = ({
  filter,
  helpers,
  propertySchema,
  open,
  onClose,
  anchorEl,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const handleChangeOperator = (event: SelectChangeEvent) => {
    helpers.handleChangeOperatorFilters(filter.key, event.target.value as Filter['operator']);
  };

  const displayOperatorAndFilter = () => {
    // Specific field
    if (propertySchema.schema_property_name === 'scenario_recurrence') {
      return (<ScenarioStatusFilter propertySchema={propertySchema} helpers={helpers} />);
    }

    const operators = availableOperators(propertySchema);
    return (
      <>
        <Select
          value={filter.operator ?? operators[0]}
          label="Operator"
          variant="standard"
          fullWidth
          onChange={handleChangeOperator}
          style={{ marginBottom: 15 }}
        >
          {operators.map((value) => (
            <MenuItem key={value} value={value}>
              {t(OperatorKeyValues[value])}
            </MenuItem>
          ))}
        </Select>
        {<FilterChipPopoverInput filter={filter} helpers={helpers} propertySchema={propertySchema} />}
      </>
    );
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      PaperProps={{ elevation: 1, style: { marginTop: 10 } }}
    >
      <div
        style={{
          width: 250,
          padding: 8,
        }}
      >
        {displayOperatorAndFilter()}
      </div>
    </Popover>
  );
};
export default FilterChipPopover;
