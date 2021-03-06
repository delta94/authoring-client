import { Maybe } from 'tsmonad';
import { Map } from 'immutable';
import { authenticatedFetch } from './common';
import { configuration } from '../../actions/utils/config';
import {
  DataSet, DatasetStatus, AnalyticsByResource, AnalyticsByPart, AnalyticsBySkill,
} from 'types/analytics/dataset';
import { caseOf } from 'utils/utils';
import { getFormHeaders, credentials } from 'actions/utils/credentials';
import { CourseIdVers, CourseGuid } from 'data/types';

const parseDatasetJson = (json: any): DataSet => ({
  byResource: json.datasetBlob
    ? Maybe.just(json.datasetBlob.byResource.reduce(
      (acc, val) => acc.set(val.resource, val),
      Map<string, AnalyticsByResource>(),
    ))
    : Maybe.nothing(),
  byResourcePart: json.datasetBlob
    ? Maybe.just(json.datasetBlob.byPart.reduce(
      (acc, val) => acc.set(
        val.resourceId,
        (acc.get(val.resourceId) || Map<string, AnalyticsByPart>()).set(val.part, val),
      ),
      Map<string, Map<string, AnalyticsByPart>>(),
    ))
    : Maybe.nothing(),
  bySkill: json.datasetBlob
    ? Maybe.just(json.datasetBlob.bySkill.reduce(
      (acc, val) => acc.set(val.skill, val),
      Map<string, AnalyticsBySkill>(),
    ))
    : Maybe.nothing(),
  status: caseOf<DatasetStatus>(json.datasetStatus)({
    DONE: DatasetStatus.DONE,
    FAILED: DatasetStatus.FAILED,
    PROCESSING: DatasetStatus.PROCESSING,
  })(DatasetStatus.DONE),
  dateCreated: json.dateCreated,
  dateCompleted: json.dateCompleted,
  message: json.message,
});

type FetchDataSetResponse = DataSet;

export function fetchDataSet(dataSetId: string): Promise<FetchDataSetResponse> {

  const url = `${configuration.baseUrl}/analytics/dataset/${dataSetId}`;
  const method = 'GET';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return parseDatasetJson(json);
    });
}

type GetAllDataSetsResponse = DataSet[];

export function getAllDataSets(course: CourseGuid | CourseIdVers): Promise<GetAllDataSetsResponse> {

  const url = `${configuration.baseUrl}/analytics/${course.value()}`;
  const method = 'GET';

  return (authenticatedFetch({ url, method }) as any)
    .then((jsonArray) => {
      return jsonArray.map(json => parseDatasetJson(json));
    });
}

type CreateDatasetResponse = {
  guid: string,
  message: string,
};

export function createDataSet(course: CourseGuid | CourseIdVers): Promise<CreateDatasetResponse> {

  const url = `${configuration.baseUrl}/analytics/dataset/${course.value()}`;
  const method = 'POST';

  return (authenticatedFetch({ url, method }) as any)
    .then((json) => {
      return json as CreateDatasetResponse;
    });
}

export function downloadDataset(
  dataSetGuid: string, title: string, version: string): Promise<void> {
  const url = `${configuration.baseUrl}/analytics/dataset/${dataSetGuid}/export`;
  const method = 'GET';
  const headers = getFormHeaders(credentials);

  return fetch(url, { method, headers })
    .then(response => response.blob())
    .then((blob) => {
      const dlUrl = (window as any).URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${title} v${version} Dataset.zip`;
      a.click();
    });
}
