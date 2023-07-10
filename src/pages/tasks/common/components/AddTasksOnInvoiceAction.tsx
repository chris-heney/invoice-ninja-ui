/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { Task } from '$app/common/interfaces/task';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useState } from 'react';
import { MdAddCircleOutline } from 'react-icons/md';
import { AddTasksOnInvoiceModal } from './AddTasksOnInvoiceModal';
import { toast } from '$app/common/helpers/toast/toast';
import { request } from '$app/common/helpers/request';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { AxiosError } from 'axios';
import { route } from '$app/common/helpers/route';
import { useQueryClient } from 'react-query';

interface Props {
  tasks: Task[];
  isBulkAction?: boolean;
}

export function AddTasksOnInvoiceAction(props: Props) {
  const { tasks, isBulkAction } = props;

  const queryClient = useQueryClient();

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleOpenModal = () => {
    if (!tasks.length) {
      return toast.error('no_invoices_found');
    }

    const clientIdsOfSelectedTasks = tasks.map((task) => task.client_id);

    const isAnyClientEmpty = clientIdsOfSelectedTasks.some((id) => !id);

    if (isAnyClientEmpty) {
      return toast.error('no_invoices_found');
    }

    if (clientIdsOfSelectedTasks.length) {
      const clientId = clientIdsOfSelectedTasks[0];

      const isAnyClientDifferent = clientIdsOfSelectedTasks.some(
        (id) => id !== clientId
      );

      if (isAnyClientDifferent) {
        return toast.error('multiple_client_error');
      }
    }

    toast.processing();

    queryClient.fetchQuery(
      route(
        '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
        {
          clientId: tasks[0].client_id,
        }
      ),
      () =>
        request(
          'GET',
          endpoint(
            '/api/v1/invoices?client_id=:clientId&include=client&status=active&per_page=100',
            {
              clientId: tasks[0].client_id,
            }
          )
        )
          .then((response: GenericSingleResourceResponse<Invoice[]>) => {
            toast.dismiss();

            if (!response.data.data.length) {
              return toast.error('no_invoices_found');
            }

            setInvoices(response.data.data);

            setIsModalVisible(true);
          })
          .catch((error: AxiosError) => {
            toast.error();
            console.error(error);
          })
    );
  };

  return (tasks.length && tasks[0].client_id && !tasks[0].invoice_id) ||
    isBulkAction ? (
    <>
      <AddTasksOnInvoiceModal
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        tasks={tasks}
        invoices={invoices}
      />

      <DropdownElement
        onClick={handleOpenModal}
        icon={<Icon element={MdAddCircleOutline} />}
      >
        {trans('add_to_invoice', { invoice: '' })}
      </DropdownElement>
    </>
  ) : (
    <></>
  );
}