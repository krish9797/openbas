import React, { FunctionComponent } from 'react';
import { Box } from '@mui/material';
import { FilterHelpers } from './FilterHelpers';
import type { Filter, FilterGroup, PropertySchemaDTO } from '../../../../utils/api-types';
import FilterChip from './FilterChip';
import FilterModeChip from './FilterModeChip';

interface Props {
  propertySchemas: PropertySchemaDTO[];
  filterGroup?: FilterGroup;
  availableFilterNames?: string[];
  helpers: FilterHelpers;
  pristine: boolean;
}

const FilterChips: FunctionComponent<Props> = ({
  propertySchemas,
  filterGroup,
  availableFilterNames = [],
  helpers,
  pristine,
}) => {
  const filters = filterGroup?.filters?.filter((f) => availableFilterNames.length === 0 || availableFilterNames.includes(f.key)) ?? [];

  const propertySchema = (filter: Filter) => {
    return propertySchemas.find((p) => p.schema_property_name === filter.key);
  };

  const handleSwitchMode = () => helpers.handleSwitchMode();

  if (filters.length === 0) {
    return <></>;
  }

  return (
    <Box
      sx={{
        padding: '12px 4px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {filters.map((filter, idx) => {
        const property = propertySchema(filter);
        if (!property) {
          return (<React.Fragment key={filter.key}></React.Fragment>);
        }
        return (
          <React.Fragment key={filter.key}>
            {idx !== 0 && <FilterModeChip onClick={handleSwitchMode} mode={filterGroup?.mode} />}
            <FilterChip
              filter={filter}
              helpers={helpers}
              propertySchema={property}
              pristine={pristine}
            />
          </React.Fragment>
        );
      })
      }
    </Box>
  );
};

export default FilterChips;
