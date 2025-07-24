import { BaseOptionComponent, useDomState } from "@html_builder/core/utils";

export class ServiceCardOption extends BaseOptionComponent {
    static template = "website_local_services.ServiceCardOption";
    static props = {};
}

export class ServiceCardTooltipOption extends BaseOptionComponent {
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