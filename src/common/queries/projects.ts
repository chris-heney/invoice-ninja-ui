/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { Project } from 'common/interfaces/project';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useBlankProjectQuery() {
  return useQuery<Project>(
    '/api/v1/projects/create',
    () =>
      request('GET', endpoint('/api/v1/projects/create')).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}

export function useProjectQuery(params: { id: string | undefined }) {
  return useQuery<Project>(
    generatePath('/api/v1/projects/:id', { id: params.id }),
    () =>
      request('GET', endpoint('/api/v1/projects/:id', { id: params.id })).then(
        (response) => response.data.data
      ),
    { staleTime: Infinity }
  );
}
