import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

import { _t } from "@web/core/l10n/translation";

export class ImageTooltip extends Interaction {
    static selector = ".o_carousel_service_card";
    dynamicContent = {
        _root: {
            "t-att-title": () => {
                if (this.el.dataset.tooltipDisplay === "true") {
                    const imageEl = this.el.querySelector(".o_record_cover_image");
                    const backgroundImage = imageEl?.style.backgroundImage;
                    return _t("Click to view details");
                } else {
                    return "";
                }
            },
        },
    };
}

registry
    .category("public.interactions")
    .add("website_local_services.image_tooltip", ImageTooltip);

registry
    .category("public.interactions.edit")
    .add("website_local_services.image_tooltip", {
        Interaction: ImageTooltip,
    });
