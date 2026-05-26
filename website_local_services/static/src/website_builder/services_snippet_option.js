import { BaseOptionComponent } from "@html_builder/core/base_option_component";
import { useDomState } from "@html_builder/core/utils";
import { registry } from "@web/core/registry";

export class ServiceCardTooltipOption extends BaseOptionComponent {
    static id = "service_card_tooltip";
    static template = "website_local_services.ServiceCardTooltipOption";
    static props = {};

    setup() {
        super.setup();
        this.state = useDomState((cardEl)=> {
            if (cardEl) {
                cardEl.dispatchEvent(new CustomEvent("content_changed", { bubbles: true }));
            }
        });
    }
}

registry.category("website-options").add(ServiceCardTooltipOption.id, ServiceCardTooltipOption);
