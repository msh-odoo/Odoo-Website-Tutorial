import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";

import { AppointmentDialog } from "@website_local_services/components/appointment_dialog";

export class ProviderDetails extends Interaction {
    static selector = ".oe_provider_details";
    dynamicContent = {
        ".oe_book_appointment": {
            "t-on-click.prevent": this.onBookAppointment,
        },
    };

    /**
     * @param {MouseEvent|KeyboardEvent} ev
     * @param {HTMLElement} currentTargetEl
     */
    async onBookAppointment(ev, currentTargetEl) {
        debugger;
        this.services.dialog.add(AppointmentDialog, {
            onSave: async () => {
                await rpc("/website_local_services/book_appointment", {
                    provider_id: currentTargetEl.dataset.providerId,
                }).then(() => {
                    this.services.notification.add(_t("Appointment booked successfully!"));
                }).catch((error) => {
                    this.services.notification.add(_t("Failed to book appointment: ") + error.message, { type: "danger" });
                });
            },
        });
    }
}

registry
    .category("public.interactions")
    .add("website_local_services.provider_details", ProviderDetails);
