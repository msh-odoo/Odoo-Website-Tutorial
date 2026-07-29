import { registry } from "@web/core/registry";
import { Interaction } from "@web/public/interaction";
import { rpc } from "@web/core/network/rpc";
import { _t } from "@web/core/l10n/translation";

export class TrackWishlistInteraction extends Interaction {
    static selector = ".o_wetrack_list .o_wetrack_wishlist";
    dynamicContent = {
        _root: {
            "t-on-click.prevent": this.onClickWishlist,
        },
    };

    /**
     * Toggle wishlist
     */
    async onClickWishlist(ev) {
        const button = ev.currentTarget;
        const trackId = Number(button.dataset.trackId);

        button.disabled = true;
        const reminderOnValue = !ev.currentTarget.classList.contains("btn-danger")

        try {
            const result = await rpc("/oxp/tracks/wishlist", {
                track_id: trackId,
                set_reminder_on: reminderOnValue,
            });

            this.updateButton(button, result.reminderOn);

            this.services.notification.add(
                result.reminderOn
                    ? _t("Added to wishlist")
                    : _t("Removed from wishlist"),
                {
                    type: "success",
                }
            );
        } catch {
            this.services.notification.add(
                _t("Something went wrong."),
                {
                    type: "danger",
                }
            );
        } finally {
            button.disabled = false;
        }
    }

    /**
     * Update UI
     */
    updateButton(button, inWishlist) {
        button.classList.toggle("btn-danger", inWishlist);
        button.classList.toggle("btn-outline-danger", !inWishlist);

        const icon = button.querySelector("i");

        if (icon) {
            icon.classList.toggle("fa-solid", inWishlist);
            icon.classList.toggle("fa-regular", !inWishlist);
        }
    }

}

registry
    .category("public.interactions")
    .add("website_event_track_oxp.wishlist", TrackWishlistInteraction);
