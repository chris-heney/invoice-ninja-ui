/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from "react-i18next";
import { Props } from "react-select";
import { SellerSubregion } from "./components/SellerSubregion";



export function CalculateTaxes() {
    const [t] = useTranslation();


    return (
        <>
            <SellerSubregion />
        </>
    );
}
