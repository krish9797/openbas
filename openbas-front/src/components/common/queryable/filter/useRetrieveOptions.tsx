import { useState } from 'react';
import { searchInjectorByIdAsOptions } from '../../../../actions/injectors/injector-action';
import { Option } from '../../../../utils/Option';
import { searchKillChainPhasesByIdAsOption } from '../../../../actions/kill_chain_phases/killChainPhase-action';
import { searchTagByIdAsOption } from '../../../../actions/tags/tag-action';
import { searchScenarioByIdAsOption } from '../../../../actions/scenarios/scenario-actions';
import { searchAttackPatternsByIdAsOption } from '../../../../actions/AttackPattern';

const useRetrieveOptions = () => {
  const [options, setOptions] = useState<Option[]>([]);

  const searchOptions = (filterKey: string, ids: string[]) => {
    switch (filterKey) {
      case 'injector_contract_injector':
      case 'inject_injector_contract':
        searchInjectorByIdAsOptions(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'injector_contract_kill_chain_phases':
      case 'scenario_kill_chain_phases':
      case 'exercise_kill_chain_phases':
      case 'inject_kill_chain_phases':
        searchKillChainPhasesByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'payload_attack_patterns':
        searchAttackPatternsByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'asset_tags':
      case 'asset_group_tags':
      case 'scenario_tags':
      case 'exercise_tags':
      case 'inject_tags':
      case 'payload_tags':
        searchTagByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      case 'exercise_scenario':
        searchScenarioByIdAsOption(ids).then((response) => {
          setOptions(response.data);
        });
        break;
      default:
        setOptions(ids.map((id) => ({ id, label: id })));
        break;
    }
  };

  return { options, searchOptions };
};

export default useRetrieveOptions;
