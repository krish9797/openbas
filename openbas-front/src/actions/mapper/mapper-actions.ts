import {
  ExportMapperInput,
  ImportMapperAddInput,
  ImportMapperUpdateInput,
  InjectsImportTestInput,
  RawPaginationImportMapper,
  SearchPaginationInput
} from '../../utils/api-types';
import {postReferential, simpleCall, simpleDelCall, simplePostCall, simplePutCall} from '../../utils/Action';
import {Dispatch} from "redux";

const XLS_MAPPER_URI = '/api/mappers';

export const searchMappers = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${XLS_MAPPER_URI}/search`;
  return simplePostCall(uri, data);
};

export const fetchMapper = (mapperId: string) => {
  const uri = `${XLS_MAPPER_URI}/${mapperId}`;
  return simpleCall(uri);
};

export const deleteMapper = (mapperId: RawPaginationImportMapper['import_mapper_id']) => {
  const uri = `${XLS_MAPPER_URI}/${mapperId}`;
  return simpleDelCall(uri, mapperId);
};

export const createMapper = (data: ImportMapperAddInput) => {
  return simplePostCall(XLS_MAPPER_URI, data);
};

export const updateMapper = (mapperId: string, data: ImportMapperUpdateInput) => {
  const uri = `${XLS_MAPPER_URI}/${mapperId}`;
  return simplePutCall(uri, data);
};

export const storeXlsFile = (file: File) => {
  const uri = `${XLS_MAPPER_URI}/store`;
  const formData = new FormData();
  formData.append('file', file);
  return simplePostCall(uri, formData);
};

export const testXlsFile = (importId: string, input: InjectsImportTestInput) => {
  const uri = `${XLS_MAPPER_URI}/store/${importId}`;
  return simplePostCall(uri, input);
};

export const exportMapper = (input: ExportMapperInput) => {
  const uri = `${XLS_MAPPER_URI}/export`;
  return simplePostCall(uri, input);
};

export const importMapper = (formData: FormData) => (dispatch: Dispatch) => {
  const uri = `${XLS_MAPPER_URI}/import`;
  return postReferential(null, uri, formData)(dispatch);
};
