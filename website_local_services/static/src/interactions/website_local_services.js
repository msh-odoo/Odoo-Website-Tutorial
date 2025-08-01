import { Interaction } from "@web/public/interaction";
import { registry } from "@web/core/registry";

import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";
import {
    formatDateTime,
} from "@web/core/l10n/dates";
const { DateTime } = luxon;

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
    onBookAppointment(ev, currentTargetEl) {
        this.services.dialog.add(AppointmentDialog, {
            onClickBook: (ev) => {
                const contentEl = ev.currentTarget.closest(".modal-content");
                const dateVal = contentEl.querySelector("#appointment_date").value;
                const dateValue = formatDateTime(DateTime.fromSeconds(parseInt(dateVal)));
                new Promise((resolve, reject) => {
                    rpc("/website_local_services/book_appointment", {
                        appointment_date: dateValue,
                    }).then(() => {
                        this.services.notification.add(_t("Appointment booked successfully!"));
                        this.services.dialog.closeAll();
                        resolve();
                    }).catch((error) => {
                        this.services.notification.add(_t("Failed to book appointment: ") + error.message, { type: "danger" });
                        reject(error);
                    });
                });
            },
            onClose: () => {
                this.services.dialog.closeAll();
            },
        });
    }
}

registry
    .category("public.interactions")
    .add("website_local_services.provider_details", ProviderDetails);
