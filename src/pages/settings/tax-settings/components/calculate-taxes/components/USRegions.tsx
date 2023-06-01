/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from "$app/common/hooks/useCompanyChanges";
import { TaxSetting } from "$app/common/interfaces/company.interface";
import { Element } from '$app/components/cards';
import { Button, Checkbox, SelectField } from "$app/components/forms";
import { useHandleCurrentCompanyChangeProperty } from "$app/pages/settings/common/hooks/useHandleCurrentCompanyChange";
import { ChangeEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { EditSubRegionModal } from "./EditSubRegionModal";

export function USRegions() {
    const [t] = useTranslation();
    const handleChange = useHandleCurrentCompanyChangeProperty();
    const companyChanges = useCompanyChanges();

    const [isOpen, setIsOpen] = useState(false);
    const [isEditSubregionModalOpen, setIsEditSubregionModalOpen] = useState<boolean>(false);
    
    const usRegions: Array<[string, TaxSetting]> = Object.entries(companyChanges.tax_data.regions.US.subregions);
    const [taxSetting, setTaxSetting] = useState<TaxSetting>(usRegions[0][1]);

    const isChecked = (apply_tax: string | boolean) => {
        return Boolean(apply_tax);
    };

    const countSelected = useMemo(() => {
        return usRegions.filter(([, taxSetting]) => isChecked(taxSetting.apply_tax)).length;
    }, [usRegions]);

    const handleChangeAndUpdateView = (value: string, checked: boolean) => {

        handleChange(value, checked);
        setIsOpen(!checked);

    };

    return (
        <>
            <Element leftSide={t('united_states')}>
                <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-4">
                    <SelectField
                        id="tax_data.regions.US.tax_all_subregions"
                        className=""
                        onValueChange={(value) => 
                            handleChangeAndUpdateView('tax_data.regions.US.tax_all_subregions', value === "true")
                        }
                    >
                        <option value="true">{t('tax_all')}</option>
                        <option value="false">{t('tax_selected')} - [ {countSelected} {t('selected')} ]</option>
                    </SelectField>
                    </div>

                    <div className="flex col-span-1 col-start-5 col-end-6 justify-end">
                    <Button
                        type="primary"
                        className=""
                        onClick={(e: ChangeEvent<HTMLInputElement>) => {
                            e.preventDefault();
                            setIsOpen((isOpen) => !isOpen)
                        }}
                    >
                        {isOpen ? t('hide') : t('show')}
                    </Button>
                    </div>
                </div>
            </Element>
            {isOpen && (
                
                usRegions?.map((value: [string, TaxSetting], index) => (
                    
                    <div className="border py-4 sm:py-3 sm:grid sm:grid-cols-3 sm:gap-10 flex flex-col lg:flex-row undefined px-5 sm:px-6 lg:items-center" key={index}>

                        <div className="flex col-span-1 items-center justify-start pl-5">
                            <Checkbox
                                id={`tax_data.regions.US.subregions.${value[0]}`}
                                value={`tax_data.regions.US.subregions.${value[0]}.apply_tax`}
                                checked={value[1].apply_tax ? true : false}
                                className="flex justify-end h-6 w-6 rounded-half shadow"
                                onValueChange={(value, checked) =>
                                    
                                    handleChange(
                                        value,
                                        checked,
                                    )
                                    
                                }                           
                            ></Checkbox>

                            <div className="">
                                {value[0]}
                            </div>
                        </div>

                        <div className="">
                            {value[1].tax_name} {value[1].tax_rate}% {value[1].reduced_tax_rate ?  ` :: ${t('reduced_rate')} ${value[1].reduced_tax_rate}%` : ''}
                        </div>  
                    
                        <div className="flex justify-end">
                            <Button 
                                type="primary" 
                                className=""
                                onClick={(e: ChangeEvent<HTMLInputElement>) => {
                                    e.preventDefault();
                                    setTaxSetting(value[1]);
                                    setIsEditSubregionModalOpen(true)
                                }}
                            >
                                {t('edit')}
                            </Button>
                        </div>
                    </div>
                ))

            )}


            <EditSubRegionModal
                visible={isEditSubregionModalOpen}
                setVisible={setIsEditSubregionModalOpen}
                region="US"
                subregion="AL"
                taxSetting={taxSetting}
            />

        </>
    );
}
