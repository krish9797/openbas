import React, { FunctionComponent, useEffect, useState } from 'react';
import { Autocomplete, SelectChangeEvent, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FieldError } from 'react-hook-form';
import type { FilterGroup } from '../utils/api-types';
import { initSorting, Page } from './common/queryable/Page';
import { useFormatter } from './i18n';
import InjectIcon from '../admin/components/common/injects/InjectIcon';
import { isNotEmptyField } from '../utils/utils';
import { searchInjectorContracts } from '../actions/InjectorContracts';
import type { InjectorContractStore } from '../actions/injector_contracts/InjectorContract';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
}));

interface Props {
  label: string;
  onChange: (data: string | null | undefined) => void;
  error: FieldError | undefined;
  fieldValue: string | undefined;
}

const InjectContractComponent: FunctionComponent<Props> = ({
  label,
  onChange,
  error,
  fieldValue,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, tPick } = useFormatter();

  // Pagination
  const [contracts, setContracts] = useState<InjectorContractStore[]>([]);
  const searchContract = (event: React.SyntheticEvent) => {
    const selectChangeEvent = event as SelectChangeEvent;
    const val = selectChangeEvent?.target.value ?? '';
    return contracts.filter(
      (type) => type.injector_contract_id.includes(val)
        || tPick(type.injector_contract_labels).includes(val),
    );
  };

  const importFilter: FilterGroup = {
    mode: 'and',
    filters: [
      {
        key: 'injector_contract_import_available',
        operator: 'eq',
        mode: 'and',
        values: ['true'],
      }],
  };
  const searchPaginationInput = {
    sorts: initSorting('injector_contract_labels'),
    filterGroup: importFilter,
  };

  useEffect(() => {
    const finalSearchPaginationInput = {
      ...searchPaginationInput,
      textSearch: '',
      page: 0,
      size: 100,
    };

    searchInjectorContracts(finalSearchPaginationInput).then((result: { data: Page<InjectorContractStore> }) => {
      const { data } = result;
      setContracts(data.content);
    });
  }, []);

  const [value, setValue] = React.useState<string | null | undefined>(fieldValue ?? '');

  return (
    <Autocomplete
      selectOnFocus
      openOnFocus
      autoHighlight
      noOptionsText={t('No available options')}
      getOptionLabel={(option) => tPick(option.injector_contract_labels)}
      renderInput={
        (params) => (
          <TextField
            {...params}
            label={t(label)}
            style={{ marginTop: 20 }}
            variant="outlined"
            size="small"
            InputLabelProps={{ required: true }}
            error={!!error}
            helperText={error?.message}
          />
        )
      }
      options={contracts}
      value={contracts.find((i) => i.injector_contract_id === value) ?? null}
      onChange={(_event, injectorContract) => {
        setValue(injectorContract?.injector_contract_id);
        onChange(injectorContract?.injector_contract_id);
      }}
      onInputChange={(event) => searchContract(event)}
      renderOption={(props, option) => (
        <li {...props}>
          <div className={classes.icon}>
            <InjectIcon
              type={
                option.injector_contract_payload
                  ? (option.injector_contract_payload?.payload_collector_type ?? option.injector_contract_payload?.payload_type)
                  : option.injector_contract_injector_type
              }
              isPayload={isNotEmptyField(option.injector_contract_payload)}
            />
          </div>
          <div className={classes.text}>
            {tPick(option.injector_contract_labels)}
          </div>
        </li>
      )}
    />
  );
};

export default InjectContractComponent;
