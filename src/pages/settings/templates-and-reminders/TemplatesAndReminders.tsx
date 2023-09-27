/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button, InputField, Link, SelectField } from '$app/components/forms';
import { freePlan } from '$app/common/guards/guards/free-plan';
import { endpoint, isHosted, isSelfHosted } from '$app/common/helpers';
import { generateEmailPreview } from '$app/common/helpers/emails/generate-email-preview';
import { request } from '$app/common/helpers/request';
import { EmailTemplate } from '$app/common/hooks/emails/useResolveTemplate';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useShouldDisableAdvanceSettings } from '$app/common/hooks/useShouldDisableAdvanceSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Settings as CompanySettings } from '$app/common/interfaces/company.interface';
import { TemplateBody, Templates } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { AdvancedSettingsPlanAlert } from '$app/components/AdvancedSettingsPlanAlert';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
import { Settings } from '$app/components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHandleCompanySave } from '../common/hooks/useHandleCompanySave';
import { useHandleCurrentCompanyChangeProperty } from '../common/hooks/useHandleCurrentCompanyChange';
import { Variable } from './common/components/Variable';
import { commonVariables } from './common/constants/variables/common-variables';
import { paymentVariables } from './common/constants/variables/payment-variables';
import Toggle from '$app/components/forms/Toggle';
import frequencies from '$app/common/constants/frequency';
import { useDiscardChanges } from '../common/hooks/useDiscardChanges';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { cloneDeep } from 'lodash';

const REMINDERS = ['reminder1', 'reminder2', 'reminder3'];

export function TemplatesAndReminders() {
  useTitle('templates_and_reminders');

  const [t] = useTranslation();

  const pages = [
    { name: t('settings'), href: '/settings' },
    {
      name: t('templates_and_reminders'),
      href: '/settings/templates_and_reminders',
    },
  ];

  const company = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const handleSave = useHandleCompanySave();
  const onCancel = useDiscardChanges();
  const user = useCurrentUser();

  const disableSettingsField = useDisableSettingsField();

  const { data: statics } = useStaticsQuery();
  const [templateId, setTemplateId] = useState('invoice');
  const [templateBody, setTemplateBody] = useState<TemplateBody>();
  const [preview, setPreview] = useState<EmailTemplate>();
  const canChangeEmailTemplate = (isHosted() && !freePlan()) || isSelfHosted();

  const [reminderIndex, setReminderIndex] = useState<number>(-1);

  const showPlanAlert = useShouldDisableAdvanceSettings();

  const handleChangeTemplate = (currentTemplateId: string) => {
    const updatedCompanySettingsChanges: CompanySettings | undefined =
      cloneDeep(company?.settings);

    if (updatedCompanySettingsChanges) {
      delete updatedCompanySettingsChanges[
        `email_subject_${templateId}` as keyof typeof updatedCompanySettingsChanges
      ];

      delete updatedCompanySettingsChanges[
        `email_template_${templateId}` as keyof typeof updatedCompanySettingsChanges
      ];

      setTemplateId(currentTemplateId);

      handleChange('settings', updatedCompanySettingsChanges);
    }
  };

  useEffect(() => {
    if (statics?.templates && company) {
      if (REMINDERS.includes(templateId)) {
        setReminderIndex(REMINDERS.indexOf(templateId) + 1);
      } else {
        setReminderIndex(-1);
      }

      const existing = {
        subject: company.settings[
          `email_subject_${templateId}` as keyof CompanySettings
        ] as string,
        body: company.settings[
          `email_template_${templateId}` as keyof CompanySettings
        ] as string,
      };

      if (existing.subject?.length > 0 || existing.body?.length > 0) {
        setTemplateBody({ ...existing });
      } else {
        const template = statics.templates[templateId as keyof Templates] || {
          subject:
            company.settings[
              `email_subject_${templateId}` as keyof CompanySettings
            ],
          body: company.settings[
            `email_template_${templateId}` as keyof CompanySettings
          ],
        };

        setTemplateBody({ ...template });
      }
    }
  }, [statics, templateId]);

  useEffect(() => {
    handleChange(`settings.email_subject_${templateId}`, templateBody?.subject);
    handleChange(`settings.email_template_${templateId}`, templateBody?.body);

    request('POST', endpoint('/api/v1/templates'), {
      body: templateBody?.body,
      subject: templateBody?.subject,
      entity: '',
      entity_id: '',
      template: `email_template_${templateId}`,
    }).then((response) => setPreview(response.data));
  }, [templateBody]);

  const variables =
    templateId === 'payment' ? paymentVariables : commonVariables;

  return (
    <Settings
      title={t('templates_and_reminders')}
      docsLink="en/advanced-settings/#templates_and_reminders"
      breadcrumbs={pages}
      onSaveClick={handleSave}
      onCancelClick={onCancel}
      disableSaveButton={showPlanAlert}
      withoutBackButton
    >
      {showPlanAlert && <AdvancedSettingsPlanAlert />}

      <Card title={t('edit')}>
        <Element
          leftSide={
            <PropertyCheckbox
              propertyKey={
                `email_template_${templateId}` as keyof CompanySettings
              }
              labelElement={<SettingsLabel label={t('template')} />}
              defaultValue={templateId}
              defaultChecked
            />
          }
        >
          <SelectField
            value={templateId}
            onValueChange={(value) => handleChangeTemplate(value)}
            disabled={disableSettingsField(
              `email_template_${templateId}` as keyof CompanySettings
            )}
          >
            {statics &&
              Object.keys(statics.templates).map((template, index) => (
                <option value={template} key={index}>
                  {t(template)}
                </option>
              ))}

            <option value="custom1">{t('first_custom')}</option>
            <option value="custom2">{t('second_custom')}</option>
            <option value="custom3">{t('third_custom')}</option>
          </SelectField>
        </Element>

        <Element leftSide={t('subject')}>
          <InputField
            id="subject"
            value={templateBody?.subject || ''}
            onValueChange={(value) =>
              setTemplateBody(
                (current) => current && { ...current, subject: value }
              )
            }
          />
        </Element>

        <Element leftSide={t('body')}>
          {canChangeEmailTemplate ? (
            <MarkdownEditor
              value={templateBody?.body || ''}
              onChange={(value) =>
                setTemplateBody(
                  (current) => current && { ...current, body: value }
                )
              }
            />
          ) : (
            <div className="flex flex-col items-start">
              <span className="text-gray-500 text-sm">
                {t('email_template_change')}{' '}
                <strong>
                  {t('enterprise')}/{t('pro')}
                </strong>{' '}
                {t('plan')}.
              </span>
              <Link
                className="mt-2"
                external
                to={user?.company_user?.ninja_portal_url || ''}
              >
                <Button>{t('plan_change')}</Button>
              </Link>
            </div>
          )}
        </Element>
      </Card>

      {(REMINDERS.includes(templateId) ||
        templateId === 'reminder_endless') && (
        <Card>
          {REMINDERS.includes(templateId) ? (
            <>
              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey={
                      `num_days_reminder${reminderIndex}` as keyof CompanySettings
                    }
                    labelElement={<SettingsLabel label={t('days')} />}
                    defaultValue={0}
                  />
                }
              >
                <InputField
                  value={
                    company?.settings[
                      `num_days_reminder${reminderIndex}` as keyof CompanySettings
                    ] || 0
                  }
                  onValueChange={(value) =>
                    handleChange(
                      `settings.num_days_reminder${reminderIndex}`,
                      value ?? 0
                    )
                  }
                  type="number"
                />
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey={
                      `schedule_reminder${reminderIndex}` as keyof CompanySettings
                    }
                    labelElement={<SettingsLabel label={t('schedule')} />}
                    defaultValue="disabled"
                  />
                }
              >
                <SelectField
                  value={
                    company?.settings[
                      `schedule_reminder${reminderIndex}` as keyof CompanySettings
                    ] || 'disabled'
                  }
                  onValueChange={(value) =>
                    handleChange(
                      `settings.schedule_reminder${reminderIndex}`,
                      value
                    )
                  }
                  disabled={disableSettingsField(
                    `schedule_reminder${reminderIndex}` as keyof CompanySettings
                  )}
                >
                  <option value="disabled" defaultChecked>
                    {t('disabled')}
                  </option>
                  <option value="after_invoice_date">
                    {t('after_invoice_date')}
                  </option>
                  <option value="before_due_date">
                    {t('before_due_date')}
                  </option>
                  <option value="after_due_date">{t('after_due_date')}</option>
                </SelectField>
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey={
                      `property_checkbox_enable_reminder${reminderIndex}` as keyof CompanySettings
                    }
                    labelElement={<SettingsLabel label={t('send_email')} />}
                    defaultValue={false}
                  />
                }
              >
                <Toggle
                  checked={
                    Boolean(
                      company?.settings[
                        `enable_reminder${reminderIndex}` as keyof CompanySettings
                      ]
                    ) || false
                  }
                  onValueChange={(value) =>
                    handleChange(
                      `settings.enable_reminder${reminderIndex}`,
                      value
                    )
                  }
                  disabled={disableSettingsField(
                    `enable_reminder${reminderIndex}` as keyof CompanySettings
                  )}
                />
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey={
                      `late_fee_amount${reminderIndex}` as keyof CompanySettings
                    }
                    labelElement={
                      <SettingsLabel label={t('late_fee_amount')} />
                    }
                  />
                }
              >
                <InputField
                  type="number"
                  value={
                    company?.settings[
                      `late_fee_amount${reminderIndex}` as keyof CompanySettings
                    ] || ''
                  }
                  onValueChange={(value) =>
                    handleChange(
                      `settings.late_fee_amount${reminderIndex}`,
                      parseFloat(value)
                    )
                  }
                  disabled={disableSettingsField(
                    `late_fee_amount${reminderIndex}` as keyof CompanySettings
                  )}
                />
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey={
                      `late_fee_percent${reminderIndex}` as keyof CompanySettings
                    }
                    labelElement={
                      <SettingsLabel label={t('late_fee_percent')} />
                    }
                  />
                }
              >
                <InputField
                  type="number"
                  value={
                    company?.settings[
                      `late_fee_percent${reminderIndex}` as keyof CompanySettings
                    ] || ''
                  }
                  onValueChange={(value) =>
                    handleChange(
                      `settings.late_fee_percent${reminderIndex}`,
                      parseFloat(value)
                    )
                  }
                  disabled={disableSettingsField(
                    `late_fee_percent${reminderIndex}` as keyof CompanySettings
                  )}
                />
              </Element>
            </>
          ) : (
            <>
              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey="enable_reminder_endless"
                    labelElement={<SettingsLabel label={t('send_email')} />}
                    defaultValue={false}
                  />
                }
              >
                <Toggle
                  checked={Boolean(company?.settings.enable_reminder_endless)}
                  onValueChange={(value) =>
                    handleChange('settings.enable_reminder_endless', value)
                  }
                  disabled={disableSettingsField('enable_reminder_endless')}
                />
              </Element>

              <Element
                leftSide={
                  <PropertyCheckbox
                    propertyKey="endless_reminder_frequency_id"
                    labelElement={<SettingsLabel label={t('frequency')} />}
                  />
                }
              >
                <SelectField
                  value={company?.settings.endless_reminder_frequency_id || ''}
                  onValueChange={(value) =>
                    handleChange(
                      'settings.endless_reminder_frequency_id',
                      value
                    )
                  }
                  withBlank
                  disabled={disableSettingsField(
                    'endless_reminder_frequency_id'
                  )}
                >
                  {Object.keys(frequencies).map((frequency, index) => (
                    <option key={index} value={frequency}>
                      {t(frequencies[frequency as keyof typeof frequencies])}
                    </option>
                  ))}
                </SelectField>
              </Element>
            </>
          )}
        </Card>
      )}

      {preview && (
        <Card className="scale-y-100" title={preview.subject}>
          <iframe
            srcDoc={generateEmailPreview(preview.body, preview.wrapper)}
            frameBorder="0"
            width="100%"
            height={800}
          />
        </Card>
      )}

      <Card title={t('variables')}>
        <Element leftSide={t('invoice')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.invoice.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('client')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.client.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('contact')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.contact.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>

        <Element leftSide={t('company')} className="flex-wrap">
          <div className="flex flex-wrap">
            {variables.company.map((variable, index) => (
              <Variable key={index}>{variable}</Variable>
            ))}
          </div>
        </Element>
      </Card>
    </Settings>
  );
}
