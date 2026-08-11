import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { OxpTrackListInteraction } from "./track_list";

/** Editor-only component mounted by the interaction's t-component directive. */
class OxpTrackListEditMessage extends Component {
    static template = "website_event_track_oxp.s_oxp_track_list_edit_message";
}

const OxpTrackListEdit = (I) =>
    class extends I {
        dynamicContent = {
            ...this.dynamicContent,
            ".s_oxp_track_list_search": {
                "t-att-disabled": () => true,
            },
            ".s_oxp_track_list_search_form": {
                "t-on-submit.prevent": () => {},
            },
            ".s_oxp_track_list_items": {
                "t-component": OxpTrackListEditMessage,
            },
        };

        setup() {
            super.setup();
            this.removeChildren(this.listEl);
        }

        willStart() {
            this.tracks = [];
        }
    };

registry.category("public.interactions.edit").add("website_event_track_oxp.oxp_track_list", {
    Interaction: OxpTrackListInteraction,
    mixin: OxpTrackListEdit,
});
